<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

class CopyDefaultImages extends Command
{
  protected $signature = 'custom:copy-default-images';
  protected $description = 'Copy default images from resources to storage';

  /**
   * Create a new command instance.
   *
   * @return void
   */
  public function __construct()
  {
    parent::__construct();
  }

  public function handle()
  {
    $from = resource_path('defaultImages');
    $to = storage_path('app/public/images/defaultImages');

    if (!File::exists($to)) {
      File::makeDirectory($to, 0755, true);
    }

    File::copyDirectory($from, $to);

    $this->info('Default images copied successfully.');
  }
}
