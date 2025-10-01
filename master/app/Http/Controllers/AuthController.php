<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'companyID' => 'required|string|unique:users',
            'password' => 'required|string|min:6',
        ]);

        $user = User::create([
            'companyID' => $request->companyID,
            'password' => Hash::make($request->password),
        ]);

        return response()->json(['user' => $user]);
    }

    public function login(Request $request)
    {
        $request->validate([
            'employeeID' => 'required|string',
            'password' => 'required|string',
        ]);

        $user = User::where('employeeID', $request->employeeID)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'employeeID' => $user->employeeID,
            'role' => $user->role,  // Added role here
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out']);
    }

    public function user(Request $request)
    {
        return response()->json($request->user());
    }

    public function allUsers()
    {
        return response()->json(
            User::select('id', 'employeeID', 'role', 'created_at')->get()
        );
    }
    public function showByEmployeeID($employeeID)
{
    $user = User::where('employeeID', $employeeID)->first();

    if (!$user) {
        return response()->json(['message' => 'User not found'], 404);
    }

    // Return all user fields, including 'name'
    return response()->json([
        'id' => $user->id,
        'employeeID' => $user->employeeID,
        'name' => $user->name,
        'email' => $user->email,
        'role' => $user->role,
        // add other fields as needed
    ]);
}

}
