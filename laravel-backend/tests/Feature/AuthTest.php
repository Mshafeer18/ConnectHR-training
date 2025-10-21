<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_success()
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('password'),
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'test@example.com',
            'password' => 'password123',
            'device_name' => 'test-device',
        ]);

        $response->assertStatus(200)
                 ->assertJsonStructure(['access_token', 'token_type', 'user']);
    }

public function test_login_failure_with_wrong_credentials()
{
    $user = User::factory()->create([
        'email' => 'test2@example.com',
        'password' => Hash::make('password'),
    ]);

    $response = $this->postJson('/api/login', [
        'email' => 'test2@example.com',
        'password' => 'wrong-password',
    ]);

    // controller now returns 401 with message + errors array
    $response->assertStatus(401)
             ->assertJsonStructure(['message', 'status', 'errors'])
             ->assertJsonFragment(['message' => 'The provided credentials are incorrect.'])
             ->assertJsonPath('errors.email.0', 'The provided credentials are incorrect.');
}


    public function test_logout_revokes_current_token()
    {
        $user = User::factory()->create([
            'password' => Hash::make('password'),
        ]);

        // create a real personal access token (stored in DB)
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/logout');

        $response->assertStatus(200)
                 ->assertJson(['message' => 'Logged out']);

        // Ensure user has no tokens left
        $this->assertEquals(0, $user->tokens()->count());
    }
}
