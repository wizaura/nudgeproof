<?php
/**
 * Plugin Name: NudgeProof Social Proof
 * Description: Sends new WordPress user registrations to NudgeProof.
 * Version: 1.0.0
 * Requires PHP: 7.4
 * Author: NudgeProof
 */

if (!defined('ABSPATH')) exit;

class NudgeProof_Connector {
    private const OPTION = 'nudgeproof_connector_settings';

    public static function init(): void {
        add_action('admin_menu', [self::class, 'menu']);
        add_action('admin_init', [self::class, 'register_settings']);
        add_action('user_register', [self::class, 'user_registered'], 10, 1);
    }

    public static function menu(): void {
        add_options_page('NudgeProof', 'NudgeProof', 'manage_options', 'nudgeproof', [self::class, 'settings_page']);
    }

    public static function register_settings(): void {
        register_setting('nudgeproof_connector', self::OPTION, [
            'sanitize_callback' => static function ($input) {
                return [
                    'url' => esc_url_raw($input['url'] ?? ''),
                    'secret' => sanitize_text_field($input['secret'] ?? ''),
                ];
            },
        ]);
    }

    public static function settings_page(): void {
        if (!current_user_can('manage_options')) return;
        $settings = get_option(self::OPTION, []);
        ?>
        <div class="wrap"><h1>NudgeProof</h1>
            <p>Send new WordPress user registrations to your NudgeProof website.</p>
            <form method="post" action="options.php">
                <?php settings_fields('nudgeproof_connector'); ?>
                <table class="form-table"><tbody>
                    <tr><th><label for="nudgeproof-url">Webhook URL</label></th><td><input id="nudgeproof-url" class="regular-text" type="url" name="<?php echo esc_attr(self::OPTION); ?>[url]" value="<?php echo esc_attr($settings['url'] ?? ''); ?>" required></td></tr>
                    <tr><th><label for="nudgeproof-secret">Webhook secret</label></th><td><input id="nudgeproof-secret" class="regular-text" type="password" name="<?php echo esc_attr(self::OPTION); ?>[secret]" value="<?php echo esc_attr($settings['secret'] ?? ''); ?>" autocomplete="new-password" required></td></tr>
                </tbody></table>
                <?php submit_button('Save connection'); ?>
            </form>
        </div>
        <?php
    }

    public static function user_registered(int $user_id): void {
        $user = get_userdata($user_id);
        if (!$user) return;
        $name = trim($user->first_name . ' ' . $user->last_name) ?: $user->display_name;
        self::send('signup', ['name' => $name, 'source' => 'wordpress']);
    }

    private static function send(string $type, array $data): bool {
        $settings = get_option(self::OPTION, []);
        $url = $settings['url'] ?? '';
        $secret = $settings['secret'] ?? '';
        if (!$url || !$secret) return false;
        $response = wp_remote_post($url, [
            'timeout' => 5,
            'headers' => [
                'Authorization' => 'Bearer ' . $secret,
                'Content-Type' => 'application/json',
            ],
            'body' => wp_json_encode(['type' => $type, 'data' => $data]),
        ]);
        if (is_wp_error($response)) return false;
        $status = wp_remote_retrieve_response_code($response);
        return $status >= 200 && $status < 300;
    }
}

NudgeProof_Connector::init();
