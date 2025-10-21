<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Students</title>
  <style>
    table { border-collapse: collapse; }
    th, td { padding: 8px; border: 1px solid #ccc; text-align: left; }
    img.thumb { width: 60px; height: 60px; object-fit: cover; border-radius: 4px; }
    .actions form { display: inline; margin: 0; }
  </style>
</head>
<body>
  <!-- Add this near the top -->
  @auth
    <div style="text-align:right;margin-bottom:12px;">
      <span style="margin-right:8px;">{{ Auth::user()->name }}</span>
      <form method="POST" action="{{ route('logout') }}" style="display:inline">
        @csrf
        <button type="submit" style="background:none;border:0;color:#06c;cursor:pointer;text-decoration:underline;padding:0">Logout</button>
      </form>
    </div>
  @endauth
  <h1>Students</h1>

  @if(session('success'))
    <div style="color:green;">{{ session('success') }}</div>
  @endif

  <p>
    <a href="{{ route('students.create') }}">Create New Student</a>
    |
    <a href="{{ route('students.export') }}">Export XLSX</a>
  </p>

  <form action="{{ route('students.import') }}" method="POST" enctype="multipart/form-data" style="margin-bottom:16px;">
    @csrf
    <input type="file" name="file" accept=".csv, .xlsx" required>
    <button type="submit">Import CSV/XLSX</button>
  </form>

  @if($students->isEmpty())
    <p>No students found.</p>
  @else
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Photo</th>
          <th>Name</th>
          <th>Email</th>
          <th>Age</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        @foreach($students as $student)
          <tr>
            <td>{{ $student->id }}</td>
            <td>
              @if($student->getFirstMediaUrl('photos'))
                <img src="{{ $student->getFirstMediaUrl('photos','thumb') }}" alt="photo" class="thumb">
              @else
                <span style="color:#999">—</span>
              @endif
            </td>
            <td><a href="{{ route('students.show', $student) }}">{{ $student->name }}</a></td>
            <td>{{ $student->email }}</td>
            <td>{{ $student->age ?? '-' }}</td>
            <td class="actions">
              <a href="{{ route('students.edit', $student) }}">Edit</a>
              <form action="{{ route('students.destroy', $student) }}" method="POST" onsubmit="return confirm('Delete this student?')">
                @csrf
                @method('DELETE')
                <button type="submit">Delete</button>
              </form>
            </td>
          </tr>
        @endforeach
      </tbody>
    </table>
  @endif
</body>
</html>