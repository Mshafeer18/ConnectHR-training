<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreStudentRequest extends FormRequest
{
    public function authorize() { return true; }

    public function rules()
    {
        return [
            'name'  => 'required|string|max:255',
            'email' => 'required|email|unique:students,email',
            'age'   => 'nullable|integer|min:0',
            'photo' => 'nullable|image|max:5120',
        ];
    }
}
