<?php

require("loginPostgresql.php");
$connection_string = "host={$host} port={$port} dbname={$dbname} user={$user} password={$password} ";
$dbconn = pg_connect($connection_string);



// sql to delete a record
$query = "DELETE FROM trilhos WHERE nome='$_POST[nome]'";

$result = pg_query($dbconn, $query);
if (!$result) {  
  die('Invalid query: ' . $dbconn->error);
} 

pg_close($dbconn);
header('location: http://localhost/Google2/TrailsProject/sample.html');
exit;
?>
