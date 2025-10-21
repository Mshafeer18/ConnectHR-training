<!DOCTYPE html>
<html>
<head>
    <title>{{ $title }}</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
    <div class="container mt-5">
        <h1>{{ $title }}</h1>
        <p class="lead">{{ $description }}</p>
        
        <div class="mt-4">
            <h3>Our Features</h3>
            <ul class="list-group">
                @foreach($features as $feature)
                    <li class="list-group-item">{{ $feature }}</li>
                @endforeach
            </ul>
        </div>

        <div class="mt-4">
            <p>Established in {{ $yearEstablished }}</p>
        </div>

        <div class="mt-4">
            <a href="/" class="btn btn-primary">Back to Home</a>
        </div>
    </div>
</body>
</html>