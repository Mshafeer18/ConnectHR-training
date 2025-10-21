<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Edit Student</title>
  <style>
    img.thumb { width:80px; height:80px; object-fit:cover; border-radius:6px; }
    .field { margin-bottom:12px; }
  </style>
</head>
<body>
  <h1>Edit Student</h1>

  @if($errors->any())
    <div style="color:red;">
      <ul>
        @foreach($errors->all() as $error)
          <li>{{ $error }}</li>
        @endforeach
      </ul>
    </div>
  @endif

  <form action="{{ route('students.update', $student) }}" method="POST" enctype="multipart/form-data">
    @csrf
    @method('PUT')

    <div class="field">
      <label>Name</label><br>
      <input type="text" name="name" value="{{ old('name', $student->name) }}" required>
    </div>

    <div class="field">
      <label>Email</label><br>
      <input type="email" name="email" value="{{ old('email', $student->email) }}" required>
    </div>

    <div class="field">
      <label>Age</label><br>
      <input type="number" name="age" value="{{ old('age', $student->age) }}">
    </div>

    <div class="field">
      <label>Photo</label><br>
      @if($student->getFirstMediaUrl('photos'))
        <img src="{{ $student->getFirstMediaUrl('photos','thumb') }}" alt="photo" class="thumb"><br>
        <label><input type="checkbox" name="remove_photo" value="1"> Remove current photo</label><br><br>
      @endif
      <input type="file" name="photo" accept="image/*">
    </div>

    <div style="margin-top:8px;">
      <button type="submit">Update</button>
      <a href="{{ route('students.index') }}">Cancel</a>
    </div>
  </form>
</body>
</html>