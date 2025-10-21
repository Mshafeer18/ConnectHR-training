<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Student;

class StudentFactory extends Factory
{
    protected $model = Student::class;

    public function definition()
    {
        return [
            'name'  => $this->faker->name,
            'email' => $this->faker->unique()->safeEmail,
            'age'   => $this->faker->numberBetween(18, 40),
        ];
    }
}
