<?php

namespace App\Console;

use App\Console\Commands\ResetDemoAdminAccount;
use Common\Channels\UpdateAllChannelsContent;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    protected $commands = [UpdateAllChannelsContent::class];

    protected function schedule(Schedule $schedule)
    {
        $schedule->command(UpdateAllChannelsContent::class)->daily();

        if (config('common.site.demo')) {
            $schedule->command(ResetDemoAdminAccount::class)->daily();
        }

        if (config('queue.default') !== 'sync') {
            $schedule->command('horizon:snapshot')->everyFiveMinutes();
        }
    }

    protected function commands()
    {
        $this->load(__DIR__ . '/Commands');

        require base_path('routes/console.php');
    }
}
