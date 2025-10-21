<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class AboutController extends Controller
{
    public function index()
    {
        $data = [
            'title' => 'About Our Company',
            'description' => 'We are a leading software development company.',
            'features' => [
                'Quality Development',
                'Excellent Support',
                'Innovative Solutions',
                '24/7 Availability'
            ],
            'yearEstablished' => 2025
        ];
        
        return view('about', $data);
    }
}
