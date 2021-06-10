<?php


require("loginPostgresql.php");
$connection_string = "host={$host} port={$port} dbname={$dbname} user={$user} password={$password} ";
$dbconn = pg_connect($connection_string);


$query = "SELECT exists (SELECT 1 FROM trilhos WHERE nome = '$_POST[nome]')";

$result = pg_query($dbconn, $query);
if (!$result) {  
  die('Invalid query: ' . $dbconn->error);
} 

$array_result = pg_fetch_row($result);
$hasTrail = strcmp($array_result[0], 't');


if($hasTrail == 0) { 
  $values = "";
 
  if($_POST["forma"] != "" )
    $values .= "forma = '$_POST[forma]',";
  if($_POST["dificuldade"] != "" )
    $values .= "dificuldade = '$_POST[dificuldade]',";
  if($_POST["extensao"] != "" )
    $values .= "extensao = '$_POST[extensao]',";
    if($_POST["duracao"] != "" )
    $values .= "duracao = '$_POST[duracao]',";
  if($_POST["descricao"] != "" )
    $values .= "descricao = '$_POST[descricao]',";
  if($values != "") {
      $values = substr($values, 0, -1) . '';
      $query = "UPDATE trilhos SET " . $values .  "where nome =  '$_POST[nome]'"; 
  } else {

  }

} else {
  
  if($_POST["nome"] == "" || $_POST["coordinates"] == "") {
    //echo($_POST["nome"]);
    //echo($_POST["coordinates"]);
    pg_close($dbconn);
    header('location: http://localhost/Google2/TrailsProject/sample.html');
    exit;
  }

  $query = "INSERT INTO trilhos (nome, path, forma, dificuldade, extensao, duracao, descricao)
  VALUES
  ('$_POST[nome]', '$_POST[coordinates]','$_POST[forma]','$_POST[dificuldade]', '$_POST[extensao]', '$_POST[duracao]', '$_POST[descricao]')";
}

$result = pg_query($dbconn, $query);
if (!$result) {  
  die('Invalid query: ' . $dbconn->error);
}

pg_close($dbconn);
header('location: http://localhost/Google2/TrailsProject/sample.html');
exit;

?>