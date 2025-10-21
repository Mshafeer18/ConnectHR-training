<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class StudentResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'name' => (string)$this->name,
            'email' => (string)$this->email,
            'age' => $this->age,
            'photo_url' => $this->getFirstMediaUrl('photos') ?: null,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
