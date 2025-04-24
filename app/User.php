<?php namespace App;

use Common\Auth\BaseUser;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Auth;
use Laravel\Sanctum\HasApiTokens;

class User extends BaseUser
{
    use Notifiable, HasApiTokens, HasFactory;

    const MODEL_TYPE = 'user';

    protected $appends = [
        'display_name',
        'has_password',
        'model_type',
    ];

    protected $casts = [
        'id' => 'integer',
        'available_space' => 'integer',
        'email_verified_at' => 'datetime',
        'artist_id' => 'integer',
    ];

    public function getOrCreateArtist(array $values = []): Artist {
        $primaryArtist = $this->primaryArtist();
        if ($primaryArtist) {
            return $primaryArtist;
        } else {
            return $this->artists()->create([
                'name' => $values['artist_name'] ?? $this->display_name,
                'image_small' => $values['image'] ?? $this->avatar,
                'fully_scraped' => true,
            ], ['role' => 'artist']);
        }
    }

    public function primaryArtist(): ?Artist
    {
        return $this->artists()->wherePivot('role', 'artist')->first();
    }

    public function artists(): BelongsToMany {
        return $this->belongsToMany(Artist::class, 'user_artist')
            ->orderByRaw("FIELD(role, 'artist') ASC")
            ->withPivot(['role']);
    }

    public function profile(): HasOne
    {
        return $this->hasOne(UserProfile::class);
    }

    public function followedUsers(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(User::class, 'follows', 'follower_id', 'followed_id')
            ->select(['users.id', 'first_name', 'last_name', 'avatar', 'email']);
    }

    public function followers(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(User::class, 'follows', 'followed_id', 'follower_id')
            ->select(['users.id', 'first_name', 'last_name', 'avatar', 'email']);
    }

    /**
     * @return BelongsToMany
     */
    public function likedTracks()
    {
        return $this->morphedByMany(Track::class, 'likeable', 'likes')
            ->withTimestamps();
    }

    /**
     * @return BelongsToMany
     */
    public function likedAlbums()
    {
        return $this->morphedByMany(Album::class, 'likeable', 'likes')
            ->withTimestamps();
    }

    /**
     * @return BelongsToMany
     */
    public function likedArtists()
    {
        return $this->morphedByMany(Artist::class, 'likeable', 'likes')
            ->withTimestamps();
    }

    public function uploadedTracks(): HasMany
    {
        return $this->hasMany(Track::class, 'owner_id')
            ->whereNull('album_id')
            ->withCount('likes')
            ->withCount('reposts')
            ->orderBy('created_at', 'desc');
    }

    public function uploadedAlbums(): HasMany
    {
        return $this->hasMany(Album::class, 'owner_id')
            ->withCount('reposts')
            ->orderBy('created_at', 'desc');
    }

    public function playlists(): BelongsToMany
    {
        return $this->belongsToMany(Playlist::class);
    }

    public function reposts(): HasMany
    {
        return $this->hasMany(Repost::class);
    }

    public function links(): MorphMany
    {
        return $this->morphMany(ProfileLink::class, 'linkeable');
    }

    public function scopeOrderByPopularity(Builder $query, $direction = 'desc')
    {
        return $query->orderBy('email', $direction);
    }

    public static function getModelTypeAttribute(): string
    {
        return User::MODEL_TYPE;
    }

    public function toArray(bool $showAll = false): array
    {
        if (
            (!$showAll && !Auth::id()) ||
            (Auth::id() !== $this->id &&
                !Auth::user()?->hasPermission('users.update'))
        ) {
            $this->hidden = array_merge($this->hidden, [
                'first_name',
                'last_name',
                'avatar_url',
                'gender',
                'email',
                'phone',
                'card_brand',
                'has_password',
                'confirmed',
                'stripe_id',
                'roles',
                'permissions',
                'card_last_four',
                'created_at',
                'updated_at',
                'available_space',
                'email_verified_at',
                'timezone',
                'confirmation_code',
                'subscriptions',
            ]);
        }

        return parent::toArray();
    }

    public function scopeCompact(Builder $query): Builder
    {
        return $query->select(
            'users.id',
            'users.avatar',
            'users.email',
            'users.phone',
            'users.first_name',
            'users.last_name',
            'users.username',
        );
    }

    public function toSearchableArray(): array
    {
        return [
            'id' => $this->id,
            'username' => $this->username,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'email' => $this->email,
            'phone' => $this->phone,
            'created_at' => $this->created_at->timestamp ?? '_null',
            'updated_at' => $this->updated_at->timestamp ?? '_null',
        ];
    }
}
