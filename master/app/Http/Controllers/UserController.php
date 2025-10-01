<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    /**
     * Fetch all users or a single user by employeeID (query param).
     */
    public function index(Request $request)
    {
        $employeeID = $request->query('employeeID');

        if ($employeeID) {
            $user = User::where('employeeID', $employeeID)->first();

            if (!$user) {
                return response()->json(['message' => 'User not found'], 404);
            }

            return response()->json($user);
        }

        return response()->json(User::all());
    }

    /**
     * Create a new user.
     */
    public function store(Request $request)
    {
        $request->validate([
            'employeeID' => 'required|string|unique:users,employeeID',
            'firstname'  => 'required|string|max:255',
            'lastname'   => 'required|string|max:255',
            'email'      => 'required|email|unique:users,email',
            'contact'    => 'nullable|string|max:20',
            'password'   => 'required|string|min:6',
            'role'       => 'nullable|string'
        ]);

        $user = User::create([
            'employeeID' => $request->employeeID,
            'firstname'  => $request->firstname,
            'lastname'   => $request->lastname,
            'email'      => $request->email,
            'contact'    => $request->contact,
            'password'   => Hash::make($request->password),
            'role'       => $request->role ?? 'Employee'
        ]);

        return response()->json([
            'message' => 'User created successfully',
            'user'    => $user
        ], 201);
    }

    /**
     * Update user by ID.
     */
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            'employeeID' => 'required|string|unique:users,employeeID,' . $id,
            'firstname'  => 'required|string|max:255',
            'lastname'   => 'required|string|max:255',
            'email'      => 'required|email|unique:users,email,' . $id,
            'contact'    => 'nullable|string|max:20',
            'password'   => 'nullable|string|min:6',
            'role'       => 'nullable|string'
        ]);

        $user->employeeID = $request->employeeID;
        $user->firstname  = $request->firstname;
        $user->lastname   = $request->lastname;
        $user->email      = $request->email;
        $user->contact    = $request->contact;
        $user->role       = $request->role ?? $user->role;

        if ($request->filled('password')) {
            $user->password = Hash::make($request->password);
        }

        $user->save();

        return response()->json([
            'message' => 'User updated successfully',
            'user'    => $user
        ]);
    }

    /**
     * Delete user by ID.
     */
    public function destroy($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $user->delete();

        return response()->json(['message' => 'User deleted successfully']);
    }

    /**
     * Fetch user by employeeID (path param).
     */
    public function showByEmployeeID($employeeID)
    {
        $user = User::where('employeeID', $employeeID)->first();

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        return response()->json($user);
    }
}
