<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Models\Student;
use Log;

class TestJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $student;

    /**
     * Create a new job instance.
     */
    public function __construct(Student $student)
    {
        // Keep only necessary data if Student is large; serializes the model by id
        $this->student = $student;
    }

    /**
     * Execute the job.
     */
    public function handle()
    {
        // Replace with Mail::to($this->student->email)->send(new WelcomeMail($this->student));
        Log::info('TestJob running for student: '.$this->student->id.' - '.$this->student->email);

        // Simulate heavier work
        sleep(2);

        Log::info('TestJob completed for student: '.$this->student->id);
    }
}