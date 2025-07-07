<?php
require 'config.php';

// CORS headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, PUT, DELETE, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];
$data = json_decode(file_get_contents('php://input'), true);

try {
    switch ($method) {
        case 'POST':
            // Add new task
            if (!isset($data['listId']) || !isset($data['text'])) {
                http_response_code(400);
                echo json_encode(['error' => 'listId and text are required']);
                exit();
            }

            $id = generateId();
            $stmt = $pdo->prepare("INSERT INTO tasks (id, list_id, text) VALUES (?, ?, ?)");
            $stmt->execute([$id, $data['listId'], $data['text']]);

            echo json_encode(['id' => $id]);
            break;

        case 'PUT':
            if (!isset($data['id'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Task ID is required']);
                exit();
            }

            if (isset($data['completed'])) {
                $stmt = $pdo->prepare("UPDATE tasks SET completed = ? WHERE id = ?");
                $stmt->execute([$data['completed'], $data['id']]);
            } elseif (isset($data['text'])) {
                $stmt = $pdo->prepare("UPDATE tasks SET text = ? WHERE id = ?");
                $stmt->execute([$data['text'], $data['id']]);
            } else {
                http_response_code(400);
                echo json_encode(['error' => 'Either completed or text is required']);
                exit();
            }

            echo json_encode(['success' => true]);
            break;

        case 'DELETE':
            if (!isset($_GET['id'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Task ID is required']);
                exit();
            }
            $id = $_GET['id'];

            $stmt = $pdo->prepare("DELETE FROM tasks WHERE id = ?");
            $stmt->execute([$id]);

            echo json_encode(['success' => true]);
            break;

        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method Not Allowed']);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
