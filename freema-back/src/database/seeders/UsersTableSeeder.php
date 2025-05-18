<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use DateTime;

class UsersTableSeeder extends Seeder
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
        'name' => 'テストユーザー1',
        'email' => 'test1@test.com',
        'password' => bcrypt('test_pw1234'),
        'email_verified_at' => new DateTime(),
        'zipcode' => '123-4567',
        'address' => 'テスト住所'
      ],
      [
        'name' => 'テストユーザー2',
        'email' => 'test2@test.com',
        'password' => bcrypt('test_pw1234'),
        'email_verified_at' => new DateTime(),
        'zipcode' => '123-4567',
        'address' => 'テスト住所'
      ],
      [
        'name' => 'テストユーザー3',
        'email' => 'test3@test.com',
        'password' => bcrypt('test_pw1234'),
        'email_verified_at' => new DateTime(),
        'zipcode' => '123-4567',
        'address' => 'テスト住所'
      ],
    ];

    $existsData = User::all()->pluck('email')->toArray();
    $data = [];
    foreach ($params as $param) {
      if (!in_array($param['email'], $existsData)) {
        $param['created_at'] =  new DateTime();
        $param['updated_at'] =  new DateTime();
        $data[] = $param;
      }
    }

    DB::table('users')->insert($data);
  }
}
