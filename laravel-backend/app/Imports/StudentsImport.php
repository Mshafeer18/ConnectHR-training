<?php

namespace App\Imports;

use App\Models\Student;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Illuminate\Support\Str;

class StudentsImport implements ToModel, WithHeadingRow
{
    public function model(array $row)
    {
        $student = Student::create([
            'name'  => $row['name']  ?? null,
            'email' => $row['email'] ?? null,
            'age'   => isset($row['age']) ? (int)$row['age'] : null,
        ]);

        // handle photo column if present
        if (!empty($row['photo'])) {
            $photo = trim($row['photo']);

            // If it's a public URL, use addMediaFromUrl
            if (Str::startsWith($photo, ['http://', 'https://'])) {
                try {
                    $student->addMediaFromUrl($photo)->toMediaCollection('photos');
                } catch (\Exception $e) {
                    // optionally log or ignore
                }
            } else {
                // treat as local storage path (absolute or relative to storage/app/public)
                // adjust as needed for your environment
                $possible = storage_path('app/public/' . ltrim($photo, '/'));
                if (file_exists($possible)) {
                    try {
                        $student->addMedia($possible)->toMediaCollection('photos');
                    } catch (\Exception $e) {
                        // optionally log or ignore
                    }
                }
            }
        }

        return $student;
    }
}
