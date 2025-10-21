<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Create Student</title>
  <style>
    .field { margin-bottom:12px; }
    img.preview { width:80px; height:80px; object-fit:cover; border-radius:6px; display:block; margin-top:8px; }
  </style>
</head>
<body>
  <h1>Create Student</h1>

  @if($errors->any())
    <div style="color:red;">
      <ul>
        @foreach($errors->all() as $error)
          <li>{{ $error }}</li>
        @endforeach
      </ul>
    </div>
  @endif

  <form action="{{ route('students.store') }}" method="POST" enctype="multipart/form-data">
    @csrf

    <div class="field">
      <label>Name</label><br>
      <input type="text" name="name" value="{{ old('name') }}" required>
    </div>

    <div class="field">
      <label>Email</label><br>
      <input type="email" name="email" value="{{ old('email') }}" required>
    </div>

    <div class="field">
      <label>Age</label><br>
      <input type="number" name="age" value="{{ old('age') }}">
    </div>

    <div class="field">
      <label>Photo</label><br>
      <input type="file" name="photo" accept="image/*">
    </div>

    <div style="margin-top:8px;">
      <button type="submit">Save</button>
      <a href="{{ route('students.index') }}">Cancel</a>
    </div>
  </form>
</body>
</html>