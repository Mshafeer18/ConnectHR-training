<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateStudentRequest extends FormRequest
{
    public function authorize() { return true; }

    public function rules()
    {
        $studentId = $this->route('student')->id ?? null;
        return [
            'name'  => 'required|string|max:255',
            'email' => ['required','email', Rule::unique('students','email')->ignore($studentId)],
            'age'   => 'nullable|integer|min:0',
            'photo' => 'nullable|image|max:5120',
            'remove_photo' => 'nullable|boolean',
        ];
    }
}
