<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class ProductRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        return [
            'name' => 'required|string|max:191',
            'brand' => 'string|max:191',
            'content' => 'string|max:1000',
            'price' => 'required|integer|min:0',
        ];
    }

    protected function failedValidation(Validator $validator)
    {
      $response['errors']  = $validator->errors()->toArray();
      throw new HttpResponseException(response()->json($response));
    }

}
