GM := http://gmapi.azurewebsites.net

info:
	curl -s $(GM)/getVehicleInfoService -X POST -H 'Content-Type: application/json' -d '{"id": "1234", "responseType": "JSON"}' | python -m json.tool

sec:
	curl -s $(GM)/getSecurityStatusService -X POST -H 'Content-Type: application/json' -d '{"id": "1234", "responseType": "JSON"}' | python -m json.tool

fuel:
	curl -s $(GM)/getEnergyService -X POST -H 'Content-Type: application/json' -d '{"id": "1234", "responseType": "JSON"}' | python -m json.tool

engine-start:
	curl -s $(GM)/actionEngineService -X POST -H 'Content-Type: application/json' -d '{"id": "1234", "command": "START_VEHICLE", "responseType": "JSON"}' | python -m json.tool

engine-stop:
	curl -s $(GM)/actionEngineService -X POST -H 'Content-Type: application/json' -d '{"id": "1234", "command": "STOP_VEHICLE", "responseType": "JSON"}' | python -m json.tool