<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Student Details</title>
  <style>
    .container { max-width:720px; margin:24px auto; font-family: Arial, sans-serif; }
    .photo { width:160px; height:160px; object-fit:cover; border-radius:6px; display:block; margin-bottom:12px; }
    .meta { margin-bottom:8px; }
    .actions a { margin-right:12px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Student Details</h1>

    @if($student->getFirstMediaUrl('photos'))
      <img src="{{ $student->getFirstMediaUrl('photos','thumb') }}" alt="Photo of {{ $student->name }}" class="photo">
    @endif

    <p class="meta"><strong>ID:</strong> {{ $student->id }}</p>
    <p class="meta"><strong>Name:</strong> {{ $student->name }}</p>
    <p class="meta"><strong>Email:</strong> {{ $student->email }}</p>
    <p class="meta"><strong>Age:</strong> {{ $student->age ?? '-' }}</p>

    <div class="actions">
      <a href="{{ route('students.edit', $student) }}">Edit</a>
      <form action="{{ route('students.destroy', $student) }}" method="POST" style="display:inline" onsubmit="return confirm('Delete this student?')">
        @csrf
        @method('DELETE')
        <button type="submit">Delete</button>
      </form>
      <a href="{{ route('students.index') }}">Back to list</a>
    </div>
  </div>
</body>
</html>