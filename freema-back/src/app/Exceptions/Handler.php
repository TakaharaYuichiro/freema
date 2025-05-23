<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Throwable;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Validation\ValidationException;
use Illuminate\Auth\AuthenticationException;

class Handler extends ExceptionHandler
{
  /**
   * A list of the exception types that are not reported.
   *
   * @var array<int, class-string<Throwable>>
   */
  protected $dontReport = [
    //
  ];

  /**
   * A list of the inputs that are never flashed for validation exceptions.
   *
   * @var array<int, string>
   */
  protected $dontFlash = [
    'current_password',
    'password',
    'password_confirmation',
  ];

  /**
   * Register the exception handling callbacks for the application.
   *
   * @return void
   */
  public function register()
  {
    $this->reportable(function (Throwable $e) {
      //
    });
  }

  public function render($request, Throwable $exception)
  {
    // APIリクエストの場合のみJSONレスポンスを返す
    if ($request->expectsJson()) {
      return $this->handleApiException($request, $exception);
    }
    return parent::render($request, $exception);
  }
  private function handleApiException($request, Throwable $exception)
  {
    $error = [
      'message' => $exception->getMessage(),
      'code' => 'ERROR_CODE_HERE',
      'status' => 500,
    ];
    if ($exception instanceof ModelNotFoundException) {
      $error['message'] = 'Resource not found';
      $error['code'] = 'RESOURCE_NOT_FOUND';
      $error['status'] = 404;
    }
    if ($exception instanceof ValidationException) {
      $error['message'] = 'Validation failed';
      $error['code'] = 'VALIDATION_FAILED';
      $error['status'] = 422;
      $error['errors'] = $exception->errors();
    }
    if ($exception instanceof AuthenticationException) {
      $error['message'] = 'Unauthenticated';
      $error['code'] = 'UNAUTHENTICATED';
      $error['status'] = 401;
    }
    return response()->json([
      'error' => $error
    ], $error['status']);
  }
}
