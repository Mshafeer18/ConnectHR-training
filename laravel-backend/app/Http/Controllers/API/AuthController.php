<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Log;
use Throwable;

class AuthController extends Controller
{
    // POST /api/login
    public function login(LoginRequest $request)
    {
        $data = $request->validated();

        $user = User::where('email', $data['email'])->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            // consistent 401 response for bad credentials
            return response()->json([
                'message' => 'The provided credentials are incorrect.',
                'status' => 401,
                'errors' => ['email' => ['The provided credentials are incorrect.']]
            ], 401);
        }

        $tokenName = $data['device_name'] ?? 'api-token';

        try {
            $plainToken = $user->createToken($tokenName)->plainTextToken;
        } catch (Throwable $e) {
            Log::error('Token creation failed', ['error' => $e->getMessage()]);
            return response()->json([
                'message' => 'Failed to create access token',
                'status' => 500,
            ], 500);
        }

        return response()->json([
            'access_token' => $plainToken,
            'token_type' => 'Bearer',
            'user' => new UserResource($user),
            'status' => 200,
            'message' => 'Login successful'
        ], 200);
    }

    // POST /api/logout  (requires auth:sanctum)
    public function logout(Request $request)
    {
        try {
            $token = $request->user()?->currentAccessToken();
            if ($token) {
                $token->delete();
                return response()->json(['message' => 'Logged out', 'status' => 200]);
            }

            // If token not found, still return success to avoid leaking info
            return response()->json(['message' => 'Logged out', 'status' => 200]);
        } catch (Throwable $e) {
            Log::error('Logout failed', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Logout failed', 'status' => 500], 500);
        }
    }

    // POST /api/revoke-all (optional admin)
    public function revokeAll(Request $request)
    {
        try {
            $request->user()->tokens()->delete();
            return response()->json(['message' => 'All tokens revoked', 'status' => 200]);
        } catch (Throwable $e) {
            Log::error('Revoke all tokens failed', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to revoke tokens', 'status' => 500], 500);
        }
    }
}
