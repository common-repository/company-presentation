<?php
error_reporting(E_ALL);

header("content-type: text/html; Charset: utf-8");
setlocale(LC_ALL, "en_GB");

// Global variables
$action = $_POST['action']; 
$templateini = array();
//$medias = Careerpages::getAllMedias();
//$templateimages = null;
//$skilllevels = Careerpages::getSkilllevels();
//$languagelevels = Careerpages::getLanguagelevels();




//$action = $_POST['action']; 
//$templateini = array();


$templateini["key"] = $_POST['key'];
$templateini["local"] = $_POST['local'];
$templateini["subdir"] = $_POST['subdir'];
$templateini["template"] = $_POST['template'];
$templateini["locale"] = isset($_POST['locale']) && $_POST['locale'] ? $_POST['locale'] : 'en_GB';

if ($action == "getCompanyHtml") {
	echo json_encode(careerpages($action, "company", $_POST['company'], $_POST['breadcrumbs']));

} elseif ($action == "getNetworkHtml") {
	echo json_encode(careerpages($action, "network", $_POST['network'], $_POST['breadcrumbs']));

} elseif ($action == "getTeamHtml") {
	echo json_encode(careerpages($action, "team", $_POST['team'], $_POST['breadcrumbs']));

} elseif ($action == "getProfileHtml") {
	echo json_encode(careerpages($action, "profile", $_POST['profile'], $_POST['breadcrumbs']));
}

function careerpages($action, $level, $ids, $breadcrumbs) {
	global $templateini;
	
	//add POST variables
	$templateini["action"] = 'get'.ucfirst($level).($templateini["local"] ? 'Data' : 'Html');
	$templateini[strtolower($level)] = $ids;
	$templateini["breadcrumbs"] = $breadcrumbs;
	
	$ch = curl_init(); 
	curl_setopt($ch, CURLOPT_URL, 'https://'.($templateini["subdir"] ? $templateini["subdir"].'.' : '').'prodii.com/common/careerpages/php/careerpageshandler.php'); 
	curl_setopt($ch, CURLOPT_POST, count($templateini));
	curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($templateini));
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1); 
	$response = curl_exec($ch); 

	$templateini["pluginurl"] = /*(isset($_SERVER['HTTPS']) ? 'http://' : 'https://')*/'//'.$_SERVER["HTTP_HOST"].str_replace($_SERVER["DOCUMENT_ROOT"], "", dirname(dirname(__FILE__))).'/';
	$templateini["pluginpath"] = dirname(dirname(__FILE__)).'/';
	if ($templateini["local"]) {
		$templateini["templateurl"] = $templateini["pluginurl"].'templates/'.$templateini["template"].'/';
		$templateini["templatepath"] = dirname(dirname(__FILE__)).'/templates/'.$templateini["template"].'/';
	} else {
		$templateini["templateurl"] = 'https://'.($templateini["subdir"] ? $templateini["subdir"].'.' : '').'prodii.com/common/careerpages/templates/'.$templateini["template"].'/';
		$templateini["templatepath"] = '';
	}

	if($errno = curl_errno($ch)) {
		$output = "cURL error ({$errno}):\n {$error_message}";
	} else {
		if ($templateini["local"]) {
			require_once($templateini["templatepath"].'/php/careerpagestemplate.php');
			require_once('https://'.($templateini["subdir"] ? $templateini["subdir"].'.' : '').'prodii.com/common/careerpages/php/careerpageslibrary.php');

			CareerpagesLibrary::initiateLocale($templateini["locale"]);

			switch (ucfirst($level)) {
				case "Company":
					$output = CareerpagesTemplate::getCompany(json_decode($response, true));
					break;
				case "Network":
					$output = CareerpagesTemplate::getNetwork(json_decode($response, true));
					break;
				case "Team":
					$output = CareerpagesTemplate::getTeam(json_decode($response, true));
					break;
				case "Profile":
					$output = CareerpagesTemplate::getProfile(json_decode($response, true));
					break;
			}						
		} else {
			$output = json_decode($response);
		}
	}
	
	curl_close($ch);

	return $output;     
}?>