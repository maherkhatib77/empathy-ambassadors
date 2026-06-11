// ===================================================================
// API Route - טעינת תלמידים והורים מקובץ JSON (מבוסס על ה-Excel)
// הקובץ public/users-data.json נוצר מה-Excel ונכלל בפרויקט
// ===================================================================

import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import path from 'path';

export async function GET() {
  try {
    // ניסיון לקרוא מ-public/users-data.json
    const publicPath = path.join(process.cwd(), 'public', 'users-data.json');

    let fileContent: string;
    try {
      fileContent = readFileSync(publicPath, 'utf-8');
    } catch {
      // fallback ל-upload (לפיתוח מקומי)
      const uploadPath = path.join(process.cwd(), 'upload', 'Students_Parents_DB.xlsx');
      const { execSync } = require('child_process');

      const pythonScript = `
import openpyxl, json, sys
wb = openpyxl.load_workbook('${uploadPath}', read_only=True, data_only=True)
ws = wb['Students_Parents_DB']
rows = list(ws.iter_rows(values_only=True))
users = []
seen_parents = set()
for row in rows[1:]:
    student_id = row[0]
    student_name = row[1]
    class_name = row[2]
    father_id = row[3]
    father_name = row[4]
    mother_id = row[5]
    mother_name = row[6]
    if student_id is not None:
        users.append({"id": str(int(student_id)),"name": str(student_name).strip(),"role": "student","class": str(class_name).strip() if class_name else "","submitted_flag": False,"voted_flag": False})
    if father_id is not None and father_name is not None:
        pk = str(int(father_id))
        if pk not in seen_parents:
            seen_parents.add(pk)
            users.append({"id": pk,"name": str(father_name).strip(),"role": "parent","class": str(class_name).strip() if class_name else "","submitted_flag": False,"voted_flag": False})
    if mother_id is not None and mother_name is not None:
        pk = str(int(mother_id))
        if pk not in seen_parents:
            seen_parents.add(pk)
            users.append({"id": pk,"name": str(mother_name).strip(),"role": "parent","class": str(class_name).strip() if class_name else "","submitted_flag": False,"voted_flag": False})
wb.close()
sys.stdout.write(json.dumps(users, ensure_ascii=False))
`;
      const result = execSync(`python3 -c '${pythonScript.replace(/'/g, "'\\''")}'`, {
        encoding: 'utf-8',
        timeout: 15000,
      });
      fileContent = result.trim();
    }

    const users = JSON.parse(fileContent);

    return NextResponse.json({
      success: true,
      students: users.filter((u: { role: string }) => u.role === 'student').length,
      parents: users.filter((u: { role: string }) => u.role === 'parent').length,
      total: users.length,
      users,
    });
  } catch (error) {
    console.error('Error importing users:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to import users' },
      { status: 500 }
    );
  }
}