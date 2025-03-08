<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class UserDeleted extends Model
{
	protected $table = 'users_deleted';

	protected $fillable = [
		'email',
		'username',
		'first_name',
		'last_name',
		'phone',
		'deleted_by',
		'deleted_id',
	];
}

