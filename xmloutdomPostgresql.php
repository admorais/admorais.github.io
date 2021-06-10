<?php


require("loginPostgresql.php");

//echo extension_loaded('pgsql') ? 'yes':'no';

// Start XML file, create parent node

$dom = new DOMDocument("1.0");
$node = $dom->createElement("trilhos");
$parnode = $dom->appendChild($node); 

// Opens a connection to a Postgresql server and database

$connection_string = "host={$host} port={$port} dbname={$dbname} user={$user} password={$password} ";
$dbconn = pg_connect($connection_string);
 

// Select all the rows in the trilhos table


$query = "SELECT nome, ST_AsText(path) as path, forma, dificuldade, extensao, duracao, descricao FROM trilhos WHERE TRUE";
//$result = $dbconn->query($query);
$result = pg_query($dbconn, $query);
if (!$result) {  
  die('Invalid query: ' . $dbconn->error);
} 



header("Content-type: text/xml");

// Iterate through the rows, adding XML nodes for each

while ($row = pg_fetch_assoc($result)){  
  // ADD TO XML DOCUMENT NODE  
  $node = $dom->createElement("trilho");  
  $newnode = $parnode->appendChild($node);   
  $newnode->setAttribute("nome",$row['nome']);
  $newnode->setAttribute("path", $row['path']); 
  $newnode->setAttribute("forma", $row['forma']);  
  $newnode->setAttribute("dificuldade", $row['dificuldade']);
  $newnode->setAttribute("extensao", $row['extensao']);
  $newnode->setAttribute("duracao", $row['duracao']);
  $newnode->setAttribute("descricao", $row['descricao']);
}

echo $dom->saveXML();

?>
