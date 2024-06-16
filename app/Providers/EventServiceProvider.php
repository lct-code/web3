<?php

namespace App\Providers;

use App\Listeners\DeleteModelsRelatedToUser;
use App\Listeners\UpdateChannelSeoFields;
use App\Listeners\UserCreatedListener;
use Common\Admin\Appearance\Events\AppearanceSettingSaved;
use Common\Auth\Events\UsersDeleted;
use Common\Auth\Events\UserCreated;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    /**
     * The event listener mappings for the application.
     *
     * @var array
     */
    protected $listen = [
        AppearanceSettingSaved::class => [
            UpdateChannelSeoFields::class,
        ],
        UsersDeleted::class => [
            DeleteModelsRelatedToUser::class,
        ],
        UserCreated::class => [
            UserCreatedListener::class,
        ],
    ];

    /**
     * Register any events for your application.
     *
     * @return void
     */
    public function boot()
    {
        parent::boot();

        //
    }
}
