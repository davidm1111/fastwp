<?php
/**
 * WordPress configuration for FastWP Local Environment
 */

define( 'DB_NAME', 'fastwp_db' );
define( 'DB_USER', 'root' );
define( 'DB_PASSWORD', '' );
define( 'DB_HOST', 'localhost' );
define( 'DB_CHARSET', 'utf8' );
define( 'DB_COLLATE', '' );

define( 'DB_ENGINE', 'sqlite' );

// Dynamic host resolution for instant local development
if ( isset( $_SERVER['HTTP_HOST'] ) ) {
    $scheme = ( ! empty( $_SERVER['HTTPS'] ) && $_SERVER['HTTPS'] !== 'off' ) ? 'https://' : 'http://';
    define( 'WP_HOME', $scheme . $_SERVER['HTTP_HOST'] );
    define( 'WP_SITEURL', $scheme . $_SERVER['HTTP_HOST'] );
}

// Authentication Unique Keys and Salts
define('AUTH_KEY',         'b!a&`67p-m*&J>yW_5,n3u@qR~0}9%^|8*&54321_fastwp');
define('SECURE_AUTH_KEY',  'c@b(78q.n+(*K?zX`6.o4vArS_1~0&_!9(&65432_fastwp');
define('LOGGED_IN_KEY',    'd#c)89r/o,)_L@0Y~7/p5wBsT`2!1\'`@0)*76543_fastwp');
define('NONCE_KEY',        'e$d*90s:p-(+M!1Z!8:q6xCtUa3@2(~A1*+87654_fastwp');
define('AUTH_SALT',        'f%e+01t;q.)|N"2[`9;r7yDuVb4#3)_B2+,98765_fastwp');
define('SECURE_AUTH_SALT', 'g&f,12u<r/*{O#3\':<s8zEvWc5$4*`C3,-09876_fastwp');
define('LOGGED_IN_SALT',   'h\'g-23v=s0+~P$4];=t9{FwXd6%5+~D4.-10987_fastwp');
define('NONCE_SALT',       'i(h.34w>t1,|Q%5^<;u0|GxYe7&6,~E5//21098_fastwp');

$table_prefix = 'wp_';

define( 'WP_DEBUG', true );
define( 'WP_DEBUG_LOG', true );
define( 'WP_DEBUG_DISPLAY', false );

if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', __DIR__ . '/' );
}

require_once ABSPATH . 'wp-settings.php';
