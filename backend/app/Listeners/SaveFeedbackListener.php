<?php

namespace App\Listeners;

use App\Events\FeedbackReceived;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use App\Models\Staff;
use App\Models\Feedback;
use Carbon\Carbon;
use Spatie\Activitylog\Models\Activity;

class SaveFeedbackListener
{
    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
 
    public function handle(FeedbackReceived $event): void
    {
        $data = $event->data;
        try {
            $staff = Staff::findOrFail($data['staff_id']);
            if (!$staff) {
                throw new \Exception("Staff not found: " . $data['staff_id']);
            }
  
            $feedback = new Feedback();
            $feedback->staff_id   = $data['staff_id'];
            $feedback->value       = $data['value'] ?? 0;
            $feedback->save();
        } catch (\Throwable $e) {
            \Log::error('Failed to store feedback', ['error' => $e->getMessage(), 'data' => $data]);
            activity()
                ->useLog('mqtt')
                ->event('error')
                ->withProperties([
                    'error' => $e->getMessage(),
                    'data'  => $data,
                ])
                ->log('Failed to store feedback');
        }
    }
}
