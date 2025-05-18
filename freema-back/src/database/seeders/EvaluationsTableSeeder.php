<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Evaluation;
use DateTime;

class EvaluationsTableSeeder extends Seeder
{
  /**
   * Run the database seeds.
   *
   * @return void
   */
  public function run()
  {
    $params = [
      [
        'user_id' => 1,
        'product_id' => 1,
        'comment' => 'テストコメント1',
      ],
      [
        'user_id' => 2,
        'product_id' => 2,
        'comment' => 'テストコメント2',
      ],
    ];

    foreach ($params as $param) {
      $exists = (
        Evaluation::where('user_id', $param['user_id'])
        ->where('product_id', $param['product_id'])
        ->exists()
      );

      if (!$exists) {
        $param['created_at'] =  new DateTime();
        $param['updated_at'] =  new DateTime();
        DB::table('evaluations')->insert($param);
      }
    }
  }
}
