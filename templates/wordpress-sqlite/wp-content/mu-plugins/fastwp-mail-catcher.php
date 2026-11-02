<?php
/**
 * Plugin Name: FastWP Mail Catcher
 * Description: Intercepts all outgoing WordPress emails and stores them for FastWP.
 * Author: FastWP Team
 */

add_filter('pre_wp_mail', function($return, $atts) {
    $dbDir = WP_CONTENT_DIR . '/database';
    if (!file_exists($dbDir)) {
        @mkdir($dbDir, 0777, true);
    }
    $file = $dbDir . '/captured_emails.json';
    
    $emails = [];
    if (file_exists($file)) {
        $data = @file_get_contents($file);
        if ($data) {
            $emails = json_decode($data, true) ?: [];
        }
    }
    
    $to = is_array($atts['to']) ? implode(', ', $atts['to']) : $atts['to'];
    $headers = is_array($atts['headers']) ? implode("\n", $atts['headers']) : ($atts['headers'] ?? '');
    
    $from = 'WordPress <wordpress@local.fast>';
    if (preg_match('/From:\s*([^<\r\n]+<[^>\r\n]+>|[^\r\n]+)/i', $headers, $m)) {
        $from = trim($m[1]);
    }

    $newEmail = [
        'id' => uniqid('mail_'),
        'to' => $to,
        'from' => $from,
        'subject' => $atts['subject'] ?? '(Sin Asunto)',
        'message' => $atts['message'] ?? '',
        'headers' => $headers,
        'date' => date('Y-m-d H:i:s'),
        'timestamp' => time()
    ];
    
    array_unshift($emails, $newEmail);
    if (count($emails) > 50) {
        $emails = array_slice($emails, 0, 50);
    }
    
    @file_put_contents($file, json_encode($emails, JSON_PRETTY_PRINT));
    
    return true; // Bypass PHPMailer and report success
}, 10, 2);
