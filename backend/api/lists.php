<?php
require 'config.php';

// CORS headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'GET':
            // Get all lists with their tasks
            $stmt = $pdo->query("SELECT * FROM todo_lists ORDER BY id DESC");
            $lists = $stmt->fetchAll(PDO::FETCH_ASSOC);

            foreach ($lists as &$list) {
                $stmtTasks = $pdo->prepare("SELECT * FROM tasks WHERE list_id = ? ORDER BY id DESC");
                $stmtTasks->execute([$list['id']]);
                $list['tasks'] = $stmtTasks->fetchAll(PDO::FETCH_ASSOC);
            }

            echo json_encode($lists);
            break;

        case 'POST':
            // Create new list
            $data = json_decode(file_get_contents('php://input'), true);
            if (!isset($data['name'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Name is required']);
                exit();
            }

            $id = generateId();
            $name = $data['name'];

            $stmt = $pdo->prepare("INSERT INTO todo_lists (id, name) VALUES (?, ?)");
            $stmt->execute([$id, $name]);

            echo json_encode(['id' => $id]);
            break;

        case 'DELETE':
            if (!isset($_GET['id'])) {
                http_response_code(400);
                echo json_encode(['error' => 'ID is required']);
                exit();
            }
            $id = $_GET['id'];

            // Optionally, delete tasks under this list to maintain DB hygiene
            $stmtTasks = $pdo->prepare("DELETE FROM tasks WHERE list_id = ?");
            $stmtTasks->execute([$id]);

            $stmt = $pdo->prepare("DELETE FROM todo_lists WHERE id = ?");
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
