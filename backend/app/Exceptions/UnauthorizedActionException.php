<?php

namespace App\Exceptions;

use Exception;

class UnauthorizedActionException extends Exception
{
    /**
     * Create a new exception instance.
     */
    public function __construct(string $message = 'You are not authorized to perform this action')
    {
        parent::__construct($message);
    }
}
