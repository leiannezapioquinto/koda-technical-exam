<?php

namespace Tests;

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    public function createApplication(): Application
    {
        $app = parent::createApplication();
        $connection = $app['config']->get('database.default');
        $database = $app['config']->get('database.connections.pgsql.database');
        $url = $app['config']->get('database.connections.pgsql.url');
        if ($connection !== 'pgsql' || ! is_string($database) || ! str_ends_with($database, '_test') || ! empty($url)) {
            throw new \RuntimeException('Tests require a dedicated PostgreSQL database ending in _test and no DB_URL.');
        }

        return $app;
    }
}
