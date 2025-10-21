<?php

namespace Database\Seeders;

use App\Models\Post;
use Illuminate\Database\Seeder;

class PostSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $posts = [
            [
                'title' => 'Getting Started with Laravel',
                'content' => 'Laravel is a web application framework with expressive, elegant syntax. We have already laid the foundation - freeing you to create without sweating the small things.',
                'author' => 'John Doe',
                'published' => true,
            ],
            [
                'title' => 'Understanding MVC Pattern',
                'content' => 'MVC (Model-View-Controller) is a pattern in software design commonly used to implement user interfaces, data, and controlling logic. It emphasizes a separation between the software\'s business logic and display.',
                'author' => 'Jane Smith',
                'published' => true,
            ],
            [
                'title' => 'Database Management in Laravel',
                'content' => 'Laravel makes interacting with databases extremely simple. Laravel supports SQLite, MySQL, PostgreSQL, and SQL Server out of the box.',
                'author' => 'Mike Johnson',
                'published' => false,
            ]
        ];

        foreach ($posts as $post) {
            Post::create($post);
        }
    }
}
