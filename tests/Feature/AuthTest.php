<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Illuminate\Support\Facades\Hash;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use LazilyRefreshDatabase;

    public function test_registration_normalizes_email_hashes_password_and_authenticates(): void
    {
        $response = $this->postJson('/auth/register', [
            'name' => 'Alex Morgan', 'email' => 'Alex@Example.test',
            'password' => 'StrongPassword2026', 'password_confirmation' => 'StrongPassword2026',
        ]);
        $response->assertCreated()->assertJsonPath('user.email', 'alex@example.test')->assertJsonMissingPath('user.password');
        $user = User::where('email', 'alex@example.test')->firstOrFail();
        $this->assertTrue(Hash::check('StrongPassword2026', $user->password));
        $this->assertAuthenticatedAs($user);
    }

    public function test_login_authenticates_with_valid_credentials(): void
    {
        $user = User::factory()->create(['email' => 'alex@example.test', 'password' => 'StrongPassword2026']);
        $this->postJson('/auth/login', ['email' => 'ALEX@example.test', 'password' => 'StrongPassword2026'])
            ->assertOk()->assertJsonPath('user.id', $user->id)->assertJsonMissingPath('user.password');
        $this->assertAuthenticatedAs($user);
    }

    public function test_wrong_password_returns_meaningful_422_and_stays_guest(): void
    {
        User::factory()->create(['email' => 'alex@example.test']);
        $this->postJson('/auth/login', ['email' => 'alex@example.test', 'password' => 'wrong'])
            ->assertUnprocessable()->assertJsonPath('errors.email.0', 'The email or password is incorrect.');
        $this->assertGuest();
    }

    public function test_logout_ends_authentication(): void
    {
        $this->actingAs(User::factory()->create())->postJson('/auth/logout')->assertNoContent();
        $this->assertGuest();
    }

    public function test_current_user_does_not_expose_credentials(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user)->getJson('/auth/user')->assertOk()->assertJsonPath('user.id', $user->id)
            ->assertJsonMissingPath('user.password')->assertJsonMissingPath('user.remember_token');
    }

    public function test_guest_dashboard_redirects_to_login(): void
    {
        $this->get('/dashboard')->assertRedirect('/login');
    }

    public function test_empty_registration_returns_all_required_errors(): void
    {
        $this->postJson('/auth/register', [])->assertUnprocessable()->assertJsonValidationErrors(['name', 'email', 'password']);
        $this->assertDatabaseCount('users', 0);
    }

    #[DataProvider('invalidRegistrations')]
    public function test_registration_rejects_invalid_input_without_creating_user(array $change, string $field): void
    {
        $payload = array_replace(['name' => 'Alex', 'email' => 'alex@example.test', 'password' => 'StrongPassword2026', 'password_confirmation' => 'StrongPassword2026'], $change);
        $this->postJson('/auth/register', $payload)->assertUnprocessable()->assertJsonValidationErrors($field);
        $this->assertDatabaseCount('users', 0);
    }

    public static function invalidRegistrations(): array
    {
        return [
            'blank name' => [['name' => '  '], 'name'],
            'invalid email' => [['email' => 'invalid'], 'email'],
            'short password' => [['password' => 'Short123', 'password_confirmation' => 'Short123'], 'password'],
            'no numbers' => [['password' => 'abcdefghijklmnop', 'password_confirmation' => 'abcdefghijklmnop'], 'password'],
            'no letters' => [['password' => '12345678901234', 'password_confirmation' => '12345678901234'], 'password'],
            'confirmation mismatch' => [['password_confirmation' => 'Different2026'], 'password'],
        ];
    }

    public function test_duplicate_email_returns_422(): void
    {
        User::factory()->create(['email' => 'alex@example.test']);
        $this->postJson('/auth/register', ['name' => 'Alex', 'email' => 'ALEX@example.test', 'password' => 'StrongPassword2026', 'password_confirmation' => 'StrongPassword2026'])
            ->assertUnprocessable()->assertJsonValidationErrors('email');
        $this->assertDatabaseCount('users', 1);
    }

    public function test_login_rate_limit_returns_429_after_five_attempts(): void
    {
        for ($attempt = 0; $attempt < 5; $attempt++) {
            $this->postJson('/auth/login', ['email' => 'missing@example.test', 'password' => 'wrong'])->assertUnprocessable();
        }
        $this->postJson('/auth/login', ['email' => 'missing@example.test', 'password' => 'wrong'])->assertTooManyRequests();
    }
}
