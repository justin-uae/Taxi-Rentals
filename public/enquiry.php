<?php
// send-enquiry-email.php - Transport Booking Enquiry Handler

// Prevent any output before JSON response
ob_start();

// Disable HTML error output
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/error.log');

// Set error handler to catch any errors and return JSON
set_error_handler(function($errno, $errstr, $errfile, $errline) {
    error_log("PHP Error: $errstr in $errfile on line $errline");
    return true;
});

// Set exception handler
set_exception_handler(function($exception) {
    error_log("PHP Exception: " . $exception->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error occurred']);
    exit();
});

// Clear any previous output
ob_clean();

// CORS headers - MUST be set before any output
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

// Configuration
define('RECIPIENT_EMAIL', 'bookings@uaetransfers.com');
define('SITE_NAME', 'UAE Transfers');
define('SITE_DOMAIN', 'uaetransfers.com');

// Get JSON data
$json = file_get_contents('php://input');
$data = json_decode($json, true);

// Validate input
if (!$data || !isset($data['name']) || !isset($data['email']) || !isset($data['phone'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit();
}

// Sanitize contact information
$name = htmlspecialchars(strip_tags(trim($data['name'])));
$email = filter_var(trim($data['email']), FILTER_SANITIZE_EMAIL);
$phone = htmlspecialchars(strip_tags(trim($data['phone'])));

// Validate email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid email address']);
    exit();
}

// Validate name length
if (strlen($name) < 2 || strlen($name) > 100) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Name must be between 2 and 100 characters']);
    exit();
}

// Sanitize booking details
$serviceType = isset($data['serviceType']) ? htmlspecialchars($data['serviceType']) : '';
$pickupLocation = isset($data['pickupLocation']) ? htmlspecialchars($data['pickupLocation']) : '';
$dropoffLocation = isset($data['dropoffLocation']) ? htmlspecialchars($data['dropoffLocation']) : '';
$pickupDate = isset($data['pickupDate']) ? htmlspecialchars($data['pickupDate']) : '';
$pickupTime = isset($data['pickupTime']) ? htmlspecialchars($data['pickupTime']) : '';
$numberOfPersons = isset($data['numberOfPersons']) ? intval($data['numberOfPersons']) : 0;
$tripType = isset($data['tripType']) ? htmlspecialchars($data['tripType']) : '';
$distance = isset($data['distance']) ? floatval($data['distance']) : null;
$duration = isset($data['duration']) ? htmlspecialchars($data['duration']) : '';
$dropoffDate = isset($data['dropoffDate']) ? htmlspecialchars($data['dropoffDate']) : '';
$dropoffTime = isset($data['dropoffTime']) ? htmlspecialchars($data['dropoffTime']) : '';
$returnDate = isset($data['returnDate']) ? htmlspecialchars($data['returnDate']) : '';
$returnTime = isset($data['returnTime']) ? htmlspecialchars($data['returnTime']) : '';
$rentalHours = isset($data['rentalHours']) ? floatval($data['rentalHours']) : null;

// Prepare email
$to = RECIPIENT_EMAIL;
$serviceTypeDisplay = ucfirst(str_replace('-', ' ', $serviceType));
$subject = "New {$serviceTypeDisplay} Enquiry - {$name}";
$currentDate = date('F j, Y, g:i a');
$ipAddress = $_SERVER['REMOTE_ADDR'];
$userAgent = isset($_SERVER['HTTP_USER_AGENT']) ? htmlspecialchars($_SERVER['HTTP_USER_AGENT']) : 'Unknown';

// Build booking details section
$bookingDetailsHtml = '';

if ($serviceType === 'transfers') {
    $tripTypeDisplay = ucfirst($tripType);
    
    $bookingDetailsHtml .= "
    <div class='field'>
        <span class='label'>Trip Type:</span>
        <div class='value'><strong>{$tripTypeDisplay}</strong></div>
    </div>
    
    <div class='field'>
        <span class='label'>Pickup Location:</span>
        <div class='value'>{$pickupLocation}</div>
    </div>
    
    <div class='field'>
        <span class='label'>Destination:</span>
        <div class='value'>{$dropoffLocation}</div>
    </div>
    
    <div class='field'>
        <span class='label'>Pickup Date & Time:</span>
        <div class='value'><strong>{$pickupDate}</strong> at <strong>{$pickupTime}</strong></div>
    </div>";
    
    if ($distance !== null && $distance > 0) {
        $distanceFormatted = number_format($distance, 1);
        $bookingDetailsHtml .= "
    <div class='field'>
        <span class='label'>Distance:</span>
        <div class='value'>{$distanceFormatted} kms</div>
    </div>";
    }
    
    if ($duration) {
        $bookingDetailsHtml .= "
    <div class='field'>
        <span class='label'>Estimated Duration:</span>
        <div class='value'>{$duration}</div>
    </div>";
    }
    
    if ($tripType === 'return' && $returnDate) {
        $bookingDetailsHtml .= "
    <div class='field'>
        <span class='label'>Return Date & Time:</span>
        <div class='value'><strong>{$returnDate}</strong> at <strong>{$returnTime}</strong></div>
    </div>";
    }
    
} else if ($serviceType === 'daily-rental') {
    $bookingDetailsHtml .= "
    <div class='field'>
        <span class='label'>Pickup Location:</span>
        <div class='value'>{$pickupLocation}</div>
    </div>
    
    <div class='field'>
        <span class='label'>Pickup Date & Time:</span>
        <div class='value'><strong>{$pickupDate}</strong> at <strong>{$pickupTime}</strong></div>
    </div>
    
    <div class='field'>
        <span class='label'>Dropoff Date & Time:</span>
        <div class='value'><strong>{$dropoffDate}</strong> at <strong>{$dropoffTime}</strong></div>
    </div>";
    
    if ($rentalHours !== null && $rentalHours > 0) {
        $rentalHoursFormatted = number_format($rentalHours, 1);
        $rentalType = $rentalHours <= 5 ? 'Half Day' : ($rentalHours < 24 ? 'Full Day' : ceil($rentalHours / 24) . ' Days');
        
        $bookingDetailsHtml .= "
    <div class='field'>
        <span class='label'>Rental Duration:</span>
        <div class='value'><strong>{$rentalHoursFormatted} hours</strong> ({$rentalType})</div>
    </div>";
    }
}

$bookingDetailsHtml .= "
    <div class='field'>
        <span class='label'>Number of Passengers:</span>
        <div class='value'><strong>{$numberOfPersons}</strong> " . ($numberOfPersons == 1 ? 'passenger' : 'passengers') . "</div>
    </div>";

// HTML email body with orange theme
$emailBody = "
<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
        }
        .container { 
            max-width: 650px; 
            margin: 20px auto; 
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .header { 
            background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); 
            color: white; 
            padding: 30px; 
            text-align: center; 
        }
        .header h1 {
            margin: 0 0 10px 0;
            font-size: 26px;
            font-weight: bold;
        }
        .header .service-type {
            background: rgba(255,255,255,0.2);
            display: inline-block;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
        }
        .content { 
            padding: 30px;
        }
        .section-title {
            background: linear-gradient(135deg, #ffedd5 0%, #fed7aa 100%);
            padding: 12px 20px;
            margin: 0 -30px 25px -30px;
            font-weight: 700;
            color: #9a3412;
            text-transform: uppercase;
            font-size: 13px;
            letter-spacing: 0.5px;
            border-left: 4px solid #f97316;
        }
        .field { 
            margin-bottom: 18px;
            padding-bottom: 18px;
            border-bottom: 1px solid #f3f4f6;
        }
        .field:last-child {
            border-bottom: none;
            padding-bottom: 0;
            margin-bottom: 0;
        }
        .label { 
            font-weight: 600; 
            color: #ea580c; 
            text-transform: uppercase; 
            font-size: 11px; 
            letter-spacing: 0.5px;
            margin-bottom: 8px;
            display: block;
        }
        .value { 
            background: #f9fafb; 
            padding: 12px 15px; 
            border-radius: 8px; 
            border-left: 4px solid #f97316;
            color: #1f2937;
            word-wrap: break-word;
        }
        .footer { 
            background: #1f2937; 
            color: #9ca3af; 
            padding: 25px; 
            text-align: center; 
            font-size: 12px; 
        }
        .footer p {
            margin: 5px 0;
        }
        .email-link {
            color: #f97316;
            text-decoration: none;
            font-weight: 600;
        }
        .phone-link {
            color: #10b981;
            text-decoration: none;
            font-weight: 600;
        }
        .metadata {
            font-size: 11px;
            color: #6b7280;
            margin-top: 8px;
            padding-top: 8px;
            border-top: 1px dashed #e5e7eb;
        }
        .urgent-notice {
            background: #fff7ed;
            border-left: 4px solid #f97316;
            padding: 15px;
            margin: 20px 0;
            border-radius: 8px;
            font-size: 13px;
            color: #9a3412;
        }
        .urgent-notice strong {
            color: #7c2d12;
        }
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>🚌 New Transport Enquiry</h1>
            <div class='service-type'>{$serviceTypeDisplay}</div>
        </div>
        <div class='content'>
            <div class='urgent-notice'>
                <strong>⏰ New Booking Enquiry</strong><br>
                A customer has requested a quote. Please respond within 2 hours for best conversion rates.
            </div>

            <div class='section-title'>Customer Information</div>
            
            <div class='field'>
                <span class='label'>Customer Name:</span>
                <div class='value'><strong>{$name}</strong></div>
            </div>
            
            <div class='field'>
                <span class='label'>Email Address:</span>
                <div class='value'>
                    <a href='mailto:{$email}' class='email-link'>{$email}</a>
                </div>
            </div>
            
            <div class='field'>
                <span class='label'>Phone Number:</span>
                <div class='value'>
                    <a href='tel:{$phone}' class='phone-link'>{$phone}</a>
                </div>
            </div>

            <div class='section-title'>Booking Details</div>
            
            {$bookingDetailsHtml}
            
            <div class='section-title'>Submission Information</div>
            
            <div class='field'>
                <span class='label'>Submission Date & Time:</span>
                <div class='value'>
                    <strong>{$currentDate}</strong>
                    <div class='metadata'>
                        <strong>IP Address:</strong> {$ipAddress}<br>
                        <strong>User Agent:</strong> {$userAgent}
                    </div>
                </div>
            </div>
        </div>
        <div class='footer'>
            <p><strong>" . SITE_NAME . "</strong></p>
            <p><a href='https://" . SITE_DOMAIN . "' style='color: #f97316; text-decoration: none;'>" . SITE_DOMAIN . "</a></p>
            <p style='margin-top: 15px; font-size: 11px;'>
                This email was automatically generated from your transport booking enquiry form.
            </p>
        </div>
    </div>
</body>
</html>
";

// Plain text version for email clients that don't support HTML
$plainTextBody = "New {$serviceTypeDisplay} Enquiry - " . SITE_NAME . "\n";
$plainTextBody .= str_repeat("=", 60) . "\n\n";
$plainTextBody .= "CUSTOMER INFORMATION:\n";
$plainTextBody .= "Name: {$name}\n";
$plainTextBody .= "Email: {$email}\n";
$plainTextBody .= "Phone: {$phone}\n\n";
$plainTextBody .= "BOOKING DETAILS:\n";
$plainTextBody .= "Service Type: {$serviceTypeDisplay}\n";

if ($serviceType === 'transfers') {
    $plainTextBody .= "Trip Type: " . ucfirst($tripType) . "\n";
    $plainTextBody .= "Pickup Location: {$pickupLocation}\n";
    $plainTextBody .= "Destination: {$dropoffLocation}\n";
    $plainTextBody .= "Pickup Date & Time: {$pickupDate} at {$pickupTime}\n";
    if ($distance) $plainTextBody .= "Distance: " . number_format($distance, 1) . " kms\n";
    if ($duration) $plainTextBody .= "Duration: {$duration}\n";
    if ($tripType === 'return' && $returnDate) {
        $plainTextBody .= "Return Date & Time: {$returnDate} at {$returnTime}\n";
    }
} else {
    $plainTextBody .= "Pickup Location: {$pickupLocation}\n";
    $plainTextBody .= "Pickup Date & Time: {$pickupDate} at {$pickupTime}\n";
    $plainTextBody .= "Dropoff Date & Time: {$dropoffDate} at {$dropoffTime}\n";
    if ($rentalHours) $plainTextBody .= "Rental Duration: " . number_format($rentalHours, 1) . " hours\n";
}

$plainTextBody .= "Number of Passengers: {$numberOfPersons}\n\n";
$plainTextBody .= "SUBMISSION INFO:\n";
$plainTextBody .= "Submitted: {$currentDate}\n";
$plainTextBody .= "IP Address: {$ipAddress}\n";

// Email headers
$headers = "MIME-Version: 1.0" . "\r\n";
$headers .= "Content-type: text/html; charset=UTF-8" . "\r\n";
$headers .= "From: " . SITE_NAME . " <noreply@" . SITE_DOMAIN . ">" . "\r\n";
$headers .= "Reply-To: {$name} <{$email}>" . "\r\n";
$headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";
$headers .= "X-Priority: 1" . "\r\n"; // High priority for booking enquiries

// Send email
$mailSent = @mail($to, $subject, $emailBody, $headers);

if ($mailSent) {
    // Log successful submission
    error_log("Transport enquiry submitted successfully from: {$email} - Service: {$serviceType}");
    
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Thank you for your enquiry! We\'ll get back to you shortly with a quote.'
    ]);
} else {
    // Log email failure
    error_log("Failed to send transport enquiry email from: {$email}");
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to send enquiry. Please try again or contact us directly at ' . RECIPIENT_EMAIL
    ]);
}

// End output buffering and send
ob_end_flush();
?>