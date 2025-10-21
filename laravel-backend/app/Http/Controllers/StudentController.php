<?php

namespace App\Http\Controllers;

use App\Models\Student;
use Illuminate\Http\Request;
use App\Jobs\TestJob;
use Illuminate\Support\Facades\Log;
use App\Exports\StudentsExport;
use App\Imports\StudentsImport;
use Maatwebsite\Excel\Facades\Excel;
use App\Http\Requests\StoreStudentRequest;
use App\Http\Requests\UpdateStudentRequest;
use App\Http\Resources\StudentResource;
use Illuminate\Support\Facades\DB;
use Throwable;

class StudentController extends Controller
{
    // ---------------- Web Methods (existing) ----------------
    
    public function index()
    {
        $students = Student::latest()->get();
        return view('students.index', compact('students'));
    }

    public function create()
    {
        return view('students.create');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'  => 'required|string|max:255',
            'email' => 'required|email|unique:students,email',
            'age'   => 'nullable|integer|min:0',
            'photo' => 'nullable|image|max:5120',
        ]);

        Log::info('STORE START', $request->except('_token'));

        $student = Student::create([
            'name'  => $data['name'],
            'email' => $data['email'],
            'age'   => $data['age'] ?? null,
        ]);

        if ($request->hasFile('photo')) {
            $student->addMediaFromRequest('photo')->toMediaCollection('photos');
        }

        TestJob::dispatch($student);

        return redirect()->route('students.index')->with('success', 'Student created successfully');
    }

    public function show(Student $student)
    {
        return view('students.show', compact('student'));
    }

    public function edit(Student $student)
    {
        return view('students.edit', compact('student'));
    }

    public function update(Request $request, Student $student)
    {
        $data = $request->validate([
            'name'  => 'required|string|max:255',
            'email' => 'required|email|unique:students,email,' . $student->id,
            'age'   => 'nullable|integer|min:0',
            'photo' => 'nullable|image|max:5120',
            'remove_photo' => 'nullable|boolean',
        ]);

        $student->update([
            'name'  => $data['name'],
            'email' => $data['email'],
            'age'   => $data['age'] ?? null,
        ]);

        if (!empty($data['remove_photo'])) {
            $student->clearMediaCollection('photos');
        }

        if ($request->hasFile('photo')) {
            $student->clearMediaCollection('photos');
            $student->addMediaFromRequest('photo')->toMediaCollection('photos');
        }

        TestJob::dispatch($student);

        return redirect()->route('students.index')->with('success', 'Student updated successfully');
    }

    public function destroy(Student $student)
    {
        $student->clearMediaCollection('photos');
        $student->delete();

        return redirect()->route('students.index')->with('success', 'Student deleted successfully');
    }

    public function export()
    {
        return Excel::download(new StudentsExport, 'students.xlsx');
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,xlsx',
        ]);

        Excel::import(new StudentsImport, $request->file('file'));

        return redirect()->route('students.index')->with('success', 'Import completed');
    }

    // ---------------- API Methods for React Frontend ----------------

// GET /api/students
public function apiIndex()
{
    try {
        $students = Student::latest()->get()->map(function ($student) {
            return [
                'id'        => $student->id,
                'name'      => $student->name,
                'email'     => $student->email,
                'age'       => $student->age,
                'photo_url' => $student->getFirstMediaUrl('photos') ?: null,
            ];
        });

        return response()->json([
            'status'  => 200,
            'message' => 'Students fetched successfully',
            'data'    => $students,
        ], 200);
    } catch (Throwable $e) {
        Log::error('apiIndex error', [
            'error' => $e->getMessage(),
            'file'  => $e->getFile(),
            'line'  => $e->getLine(),
        ]);

        return response()->json([
            'status'  => 500,
            'message' => 'Failed to fetch students',
        ], 500);
    }
}

// GET /api/students/{id}
public function apiShow($id)
{
    try {
        $student = Student::find($id);

        if (!$student) {
            return response()->json([
                'status'  => 404,
                'message' => 'Student not found',
            ], 404);
        }

        $studentData = [
            'id'        => $student->id,
            'name'      => $student->name,
            'email'     => $student->email,
            'age'       => $student->age,
            'photo_url' => $student->getFirstMediaUrl('photos') ?: null,
        ];

        return response()->json([
            'status'  => 200,
            'message' => 'Student fetched successfully',
            'data'    => $studentData,
        ], 200);
    } catch (Throwable $e) {
        Log::error('apiShow error', [
            'id'    => $id,
            'error' => $e->getMessage(),
            'file'  => $e->getFile(),
            'line'  => $e->getLine(),
        ]);

        return response()->json([
            'status'  => 500,
            'message' => 'Failed to fetch student details',
        ], 500);
    }
}


    // POST /api/students
public function apiStore(StoreStudentRequest $request)
{
    DB::beginTransaction();
    try {
        $data = $request->only(['name','email','age']);
        $student = Student::create($data);

        if ($request->hasFile('photo')) {
            $student->addMediaFromRequest('photo')->toMediaCollection('photos');
        }

        TestJob::dispatch($student);

        DB::commit();

        return (new StudentResource($student))
            ->additional(['message' => 'Student created successfully'])
            ->response()
            ->setStatusCode(201);
    } catch (Throwable $e) {
        DB::rollBack();
        Log::error('apiStore error', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
        return response()->json([
            'message' => 'Failed to create student',
            'errors' => null,
            'status' => 500,
        ], 500);
    }
}

    // PUT /api/students/{student}
public function apiUpdate(UpdateStudentRequest $request, $id)
{    
    $student = Student::find($id);

    if (! $student) {
        return response()->json([
            'status'  => 404,
            'message' => 'Student not found',
        ], 404);
    }
    DB::beginTransaction();
    try {
        $data = $request->only(['name','email','age']);
        $student->update($data);

        if ($request->filled('remove_photo')) {
            $student->clearMediaCollection('photos');
        }

        if ($request->hasFile('photo')) {
            $student->clearMediaCollection('photos');
            $student->addMediaFromRequest('photo')->toMediaCollection('photos');
        }

        TestJob::dispatch($student);

        DB::commit();

        return (new StudentResource($student))
            ->additional(['message' => 'Student updated successfully'])
            ->response()
            ->setStatusCode(200);
    } catch (Throwable $e) {
        DB::rollBack();
        Log::error('apiUpdate error', ['id' => $student->id, 'error' => $e->getMessage()]);
        return response()->json([
            'message' => 'Failed to update student',
            'errors' => null,
            'status' => 500,
        ], 500);
    }
}


    // DELETE /api/students/{student}
public function apiDestroy($id)
{    
    $student = Student::find($id);

    if (! $student) {
        return response()->json([
            'status'  => 404,
            'message' => 'Student not found',
        ], 404);
    }
    try {
        DB::beginTransaction();
        $student->clearMediaCollection('photos');
        $student->delete();
        DB::commit();
        return response()->json(['message' => 'Student deleted successfully'], 200);
    } catch (Throwable $e) {
        DB::rollBack();
        Log::error('apiDestroy error', ['id' => $student->id, 'error' => $e->getMessage()]);
        return response()->json(['message' => 'Failed to delete student', 'status' => 500], 500);
    }
}


    // GET /api/students/export -> return xlsx download for frontend
public function apiExport()
{
    try {
        return Excel::download(new StudentsExport, 'students.xlsx');
        return response()->json(['message' => 'Export completed'], 200);
    } catch (Throwable $e) {
        Log::error('apiExport error', ['error' => $e->getMessage()]);
        return response()->json(['message' => 'Export failed', 'status' => 500], 500);
    }
}

    // POST /api/students/import -> accept multipart upload from frontend and return JSON
public function apiImport(Request $request)
{
    $request->validate(['file' => 'required|file|mimes:csv,xlsx']);
    try {
        Excel::import(new StudentsImport, $request->file('file'));
        return response()->json(['message' => 'Import completed'], 200);
    } catch (Throwable $e) {
        Log::error('apiImport error', ['error' => $e->getMessage()]);   
        return response()->json(['message' => 'Import failed', 'status' => 500], 500);
    }
}


}
