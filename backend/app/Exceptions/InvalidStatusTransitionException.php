<?php

namespace App\Exceptions;

use Exception;

class InvalidStatusTransitionException extends Exception
{
    /**
     * Create a new exception instance.
     */
    public function __construct(string $message = 'Invalid status transition')
    {
        parent::__construct($message);
    }
}
