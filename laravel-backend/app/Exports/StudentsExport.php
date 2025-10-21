<?php

namespace App\Exports;

use App\Models\Student;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class StudentsExport implements FromCollection, WithHeadings, WithMapping
{
    public function collection()
    {
        return Student::with('media')->get(); // eager-load media
    }

    public function headings(): array
    {
        return ['ID', 'Name', 'Email', 'Age', 'Photo'];
    }

    public function map($student): array
    {
        // returns full URL for photo (thumb variant if exists)
        $photoUrl = $student->getFirstMediaUrl('photos', 'thumb') ?: $student->getFirstMediaUrl('photos') ?: '';

        return [
            $student->id,
            $student->name,
            $student->email,
            $student->age,
            $photoUrl,
        ];
    }
}
