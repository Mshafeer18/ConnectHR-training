<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Models\Student; // optional but handy for instanceof checks

class UpdateStudentRequest extends FormRequest
{
    public function authorize() { return true; }

    public function rules()
    {
        // get the route parameter (could be model or id; param name might be 'student' or 'id')
        $param = $this->route('student') ?? $this->route('id');

        // normalize to an integer id (if model, take ->id; if numeric string, cast)
        $studentId = null;
        if ($param instanceof Student) {
            $studentId = $param->id;
        } elseif (is_numeric($param)) {
            $studentId = (int) $param;
        }

        return [
            'name'  => 'required|string|max:255',
            'email' => [
                'required',
                'email',
                Rule::unique('students', 'email')->ignore($studentId),
            ],
            'age'   => 'nullable|integer|min:0',
            'photo' => 'nullable|image|max:5120',
            'remove_photo' => 'nullable|boolean',
        ];
    }
}
