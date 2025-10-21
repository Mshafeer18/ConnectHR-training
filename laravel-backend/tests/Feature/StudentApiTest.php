<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\User;
use App\Models\Student;
use Illuminate\Support\Facades\Hash;

class StudentApiTest extends TestCase
{
    use RefreshDatabase;

    protected function authHeaderForUser(User $user)
    {
        $token = $user->createToken('test-token')->plainTextToken;
        return ['Authorization' => 'Bearer ' . $token];
    }

    public function test_index_returns_students()
    {
        $user = User::factory()->create(['password' => Hash::make('password')]);
        Student::factory()->count(3)->create();

        $response = $this->withHeaders($this->authHeaderForUser($user))
                         ->getJson('/api/students');

        $response->assertStatus(200)
                 ->assertJsonCount(3);
    }

    public function test_store_creates_student()
    {
        $user = User::factory()->create(['password' => Hash::make('password')]);

        $payload = [
            'name' => 'Alice',
            'email' => 'alice@example.com',
            'age' => 21,
        ];

        $response = $this->withHeaders($this->authHeaderForUser($user))
                         ->postJson('/api/students', $payload);

        $response->assertStatus(201)
                 ->assertJsonFragment(['message' => 'Student created successfully']);

        $this->assertDatabaseHas('students', [
            'email' => 'alice@example.com',
            'name' => 'Alice',
            'age' => 21,
        ]);
    }

    public function test_show_returns_student()
    {
        $user = User::factory()->create(['password' => Hash::make('password')]);
        $student = Student::factory()->create();

        $response = $this->withHeaders($this->authHeaderForUser($user))
                         ->getJson('/api/students/' . $student->id);

        $response->assertStatus(200)
                 ->assertJsonFragment([
                     'id' => $student->id,
                     'email' => $student->email,
                 ]);
    }

    public function test_update_modifies_student()
    {
        $user = User::factory()->create(['password' => Hash::make('password')]);
        $student = Student::factory()->create([
            'name' => 'Old Name',
            'email' => 'old@example.com',
            'age' => 20,
        ]);

        $payload = [
            'name' => 'New Name',
            'email' => 'new@example.com',
            'age' => 22,
        ];

        $response = $this->withHeaders($this->authHeaderForUser($user))
                         ->putJson('/api/students/' . $student->id, $payload);

        $response->assertStatus(200)
                 ->assertJsonFragment(['message' => 'Student updated successfully']);

        $this->assertDatabaseHas('students', [
            'id' => $student->id,
            'name' => 'New Name',
            'email' => 'new@example.com',
            'age' => 22,
        ]);
    }

    public function test_destroy_deletes_student()
    {
        $user = User::factory()->create(['password' => Hash::make('password')]);
        $student = Student::factory()->create();

        $response = $this->withHeaders($this->authHeaderForUser($user))
                         ->deleteJson('/api/students/' . $student->id);

        $response->assertStatus(200)
                 ->assertJson(['message' => 'Student deleted successfully']);

        $this->assertDatabaseMissing('students', ['id' => $student->id]);
    }
}
