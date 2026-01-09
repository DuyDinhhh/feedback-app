<?php

namespace App\Models;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Feedback extends Model {

    use HasFactory,SoftDeletes;
    protected $primaryKey = 'id';
    public $incrementing = true;
    protected $fillable = ['staff_id', 'value', 'created_by', 'updated_by'];
 
    public function staff()
    {
        return $this->belongsTo(Staff::class, 'staff_id');
    }

    public function staffWithTrashed()
    {
        return $this->belongsTo(Staff::class, 'staff_id', 'id')->withTrashed();
    }

}
