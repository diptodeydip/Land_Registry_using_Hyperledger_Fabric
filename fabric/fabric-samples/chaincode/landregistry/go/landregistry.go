/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

/*
 * The sample smart contract for documentation topic:
 * Writing Your First Blockchain Application
 */

 package main

 /* Imports
  * 4 utility libraries for formatting, handling bytes, reading and writing JSON, and string manipulation
  * 2 specific Hyperledger Fabric specific libraries for Smart Contracts
  */
 import (
	 "bytes"
	 "encoding/json"
	 "fmt"
	 "strconv"
	 "time"
 
	 "github.com/hyperledger/fabric/core/chaincode/shim"
	 sc "github.com/hyperledger/fabric/protos/peer"
 )
 
 // Define the Smart Contract structure
 type SmartContract struct {
 }
 
 
 
 //Define Asset(Land) structure
 type Asset struct {
	 //Uniquecode   string is the key
	 OwnerNID  string 
	 Advertised string 
	 OwnerName  string 
	 LocationImage string
	 UploadTime string
	 Type string
	 AssetName string
	 Division string
	 District string
	 MaujaNo_JL string
	 KhatianNo string
	 PlotNo string
 }
 
 //Request structure
 type Request struct {
	 //Id   string OwnerNID+assetCode is the key
	 OwnerNID  string 
	 OwnerName string
	 OwnerAck string 
	 AssetName string
	 Type string
	 AssetCode string
	 Time string
	 RequestedByNID string
	 RequestedByName string
	 //InspectorAck string
 }
 // User info
 type UserInfo struct {
	 Name   string 
	 //NID_NO  string is the key
	 Email string
	 ImageUrl string
	 Password string
	 Verified string
	 Notification int
	 SentRequest int
	 ReceivedRequest int
	 
 }
 // Notification info
 type Notification struct {
	 AssetCode string
	 PreviousOwnerNID string
	 PreviousOwnerName string
	 NewOwnerNID string
	 NewOwnerName string
	 Result string
	 OwnerNID string
	 RequestedByNID string
	 Type string
	 Time string
 }
 
 /*
  * The Init method is called when the Smart Contract "fabcar" is instantiated by the blockchain network
  * Best practice is to have any Ledger initialization in separate function -- see initLedger()
  */
 func (s *SmartContract) Init(APIstub shim.ChaincodeStubInterface) sc.Response {
	 return shim.Success(nil)
 }
 
 /*
  * The Invoke method is called as a result of an application request to run the Smart Contract "fabcar"
  * The calling application program has also specified the particular smart contract function to be called, with arguments
  */
 func (s *SmartContract) Invoke(APIstub shim.ChaincodeStubInterface) sc.Response {
 
	 // Retrieve the requested Smart Contract function and arguments
	 function, args := APIstub.GetFunctionAndParameters()
	 // Route to the appropriate handler function to interact with the ledger appropriately
	 if function == "createUser" {
		 return s.createUser(APIstub,args)
	 }else if function == "queryUser" {
		 return s.queryUser(APIstub,args)
	 }else if function == "createAsset" {
		 return s.createAsset(APIstub,args)
	 }else if function == "queryMyAsset" {
		 return s.queryMyAsset(APIstub,args)
	 }else if function == "queryAsset" {
		 return s.queryAsset(APIstub,args)
	 }else if function == "Advertise" {
		 return s.Advertise(APIstub,args)
	 }else if function == "deleteAsset" {
		 return s.deleteAsset(APIstub,args)
	 }else if function == "queryAdvertise" {
		 return s.queryAdvertise(APIstub)
	 }else if function == "createRequest" {
		 return s.createRequest(APIstub,args)
	 }else if function == "deleteRequest" {
		 return s.deleteRequest(APIstub,args)
	 }else if function == "queryAllRequests" {
		 return s.queryAllRequests(APIstub)
	 }else if function == "queryRequest" {
		 return s.queryRequest(APIstub,args)
	 }else if function == "changeOwnerAck" {
		 return s.changeOwnerAck(APIstub,args)
	 }else if function == "changeOwnerShip" {
		 return s.changeOwnerShip(APIstub,args)
	 }else if function == "getHistoryForAsset" {
		 return s.getHistoryForAsset(APIstub,args)
	 }else if function == "queryAllNotification" {
		 return s.queryAllNotification(APIstub)
	 }else if function == "createNotification" {
		 return s.createNotification(APIstub,args)
	 }else if function == "changeUserNR" {
		 return s.changeUserNR(APIstub,args)
	 } else if function == "editUserInfo" {
		return s.editUserInfo(APIstub,args)
	}else if function == "editUserDp" {
		return s.editUserDp(APIstub,args)
	}
	 
	 //queryAllNotification
	 return shim.Error("Invalid Smart Contract function name.")
 }
 
 func (s *SmartContract) initLedger(APIstub shim.ChaincodeStubInterface) sc.Response {
	 return shim.Success(nil)
 }
 
 //
 // ===========================================================================================
 // constructQueryResponseFromIterator constructs a JSON array containing query results from
 // a given result iterator
 // ===========================================================================================
 func constructQueryResponseFromIterator(resultsIterator shim.StateQueryIteratorInterface) (*bytes.Buffer, error) {
	 // buffer is a JSON array containing QueryResults
	 var buffer bytes.Buffer
	 buffer.WriteString("[")
 
	 bArrayMemberAlreadyWritten := false
	 for resultsIterator.HasNext() {
		 queryResponse, err := resultsIterator.Next()
		 if err != nil {
			 return nil, err
		 }
		 // Add a comma before array members, suppress it for the first array member
		 if bArrayMemberAlreadyWritten == true {
			 buffer.WriteString(",")
		 }
		 buffer.WriteString("{\"Key\":")
		 buffer.WriteString("\"")
		 buffer.WriteString(queryResponse.Key)
		 buffer.WriteString("\"")
 
		 buffer.WriteString(", \"Record\":")
		 // Record is a JSON object, so we write as-is
		 buffer.WriteString(string(queryResponse.Value))
		 buffer.WriteString("}")
		 bArrayMemberAlreadyWritten = true
	 }
	 buffer.WriteString("]")
 
	 return &buffer, nil
 }
 
 // =========================================================================================
 // getQueryResultForQueryString executes the passed in query string.
 // Result set is built and returned as a byte array containing the JSON results.
 // =========================================================================================
 func getQueryResultForQueryString(stub shim.ChaincodeStubInterface, queryString string) ([]byte, error) {
 
	 fmt.Printf("- getQueryResultForQueryString queryString:\n%s\n", queryString)
 
	 resultsIterator, err := stub.GetQueryResult(queryString)
	 if err != nil {
		 return nil, err
	 }
	 defer resultsIterator.Close()
 
	 buffer, err := constructQueryResponseFromIterator(resultsIterator)
	 if err != nil {
		 return nil, err
	 }
 
	 fmt.Printf("- getQueryResultForQueryString queryResult:\n%s\n", buffer.String())
 
	 return buffer.Bytes(), nil
 }
 ////////////////////////////////////////////////////////////////////////////////////////////////
 
 /*
 //Request structure
 type Request struct {
	 //RequestedByNID+AssetCode   string 
	 OwnerNID  string 
	 OwnerName string
	 OwnerAck string 
	 AssetName string
	 AssetCode string
	 RequestedByNID string
	 Time string
	 RequestedByName string
	 //InspectorAck string
	 Type string
 } */
 func (s *SmartContract) createRequest(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
	 var request = Request{OwnerNID: args[1], OwnerAck: "0", AssetName: args[2], RequestedByNID: args[3] ,Type: "Request" , AssetCode: args[4], RequestedByName: args[5], Time: args[6], OwnerName: args[7]}
	 requestAsBytes, _ := json.Marshal(request)
	 APIstub.PutState(args[0], requestAsBytes)
	 return shim.Success(nil)
 }
 
 // //Query Pending Requests
 // func (s *SmartContract) queryIncomingRequests(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
 // 	var queryString = fmt.Sprintf("{\r\n\"selector\":{\r\n\"OwnerNID\":\"%v\",\r\n\"Type\":\"Request\"\r\n}\r\n}", args[0])
 // 	//"{\"selector\":{\"OwnerAck\":\"0\",\"InspectorAck\":\"0\"}}"
 
 // 	queryResults, err := getQueryResultForQueryString(APIstub, queryString)
 // 	if err != nil {
 // 		return shim.Error(err.Error())
 // 	}
 // 	return shim.Success(queryResults)
 // }
 func (s *SmartContract) queryAllRequests(APIstub shim.ChaincodeStubInterface) sc.Response {
	 var queryString = fmt.Sprintf("{\r\n\"selector\":{\r\n\"Type\":\"Request\"}\r\n}")
	 //"{\"selector\":{\"OwnerAck\":\"0\",\"InspectorAck\":\"0\"}}"
 
	 queryResults, err := getQueryResultForQueryString(APIstub, queryString)
	 if err != nil {
		 return shim.Error(err.Error())
	 }
	 return shim.Success(queryResults)
 }
 
 func (s *SmartContract) queryRequest(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
	 requestAsBytes, _ := APIstub.GetState(args[0])
	 return shim.Success(requestAsBytes)
 }
 func (s *SmartContract) changeOwnerAck(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
	 requestAsBytes, _ := APIstub.GetState(args[0])
	 request := Request{}
	 json.Unmarshal(requestAsBytes, &request)
	 request.OwnerAck = "1"
	 requestAsBytes, _ = json.Marshal(request)
	 APIstub.PutState(args[0], requestAsBytes)
	 return shim.Success(nil)
 }
 
 
 
 func (s *SmartContract) deleteRequest(stub shim.ChaincodeStubInterface, args []string) sc.Response {
	 var jsonResp string
	 var assetJSON Request
	 if len(args) != 1 {
		 return shim.Error("Incorrect number of arguments. Expecting 1")
	 }
	 assetName := args[0]
 
	 // to maintain the color~name index, we need to read the marble first and get its color
	 valAsbytes, err := stub.GetState(assetName) //get the marble from chaincode state
	 if err != nil {
		 jsonResp = "{\"Error\":\"Failed to get state for " + assetName + "\"}"
		 return shim.Error(jsonResp)
	 } else if valAsbytes == nil {
		 jsonResp = "{\"Error\":\"Asset does not exist: " + assetName + "\"}"
		 return shim.Error(jsonResp)
	 }
 
	 err = json.Unmarshal([]byte(valAsbytes), &assetJSON)
	 if err != nil {
		 jsonResp = "{\"Error\":\"Failed to decode JSON of: " + assetName + "\"}"
		 return shim.Error(jsonResp)
	 }
 
	 err = stub.DelState(assetName) //remove the marble from chaincode state
	 if err != nil {
		 return shim.Error("Failed to delete state:" + err.Error())
	 }
 
	 return shim.Success(nil)
 }
 
 /*
 // Notification info
 type Notification struct {
	 AssetCode string
	 PreviousOwnerNID string
	 PreviousOwnerName string
	 NewOwnerNID string
	 NewOwnerName string
	 Result string
	 OwnerNID string
	 RequestedByNID string
	 Type string
	 Time string
	 
 } */
 
 func (s *SmartContract) createNotification(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
	 var notification = Notification{Type:"Notification",AssetCode: args[1], PreviousOwnerNID: args[2] , PreviousOwnerName: args[3] , NewOwnerNID: args[4], NewOwnerName: args[5], Time: args[6] , Result: args[7] , OwnerNID: args[8], RequestedByNID: args[9]}
	 notificationAsBytes, _ := json.Marshal(notification)
	 APIstub.PutState(args[0], notificationAsBytes)
	 return shim.Success(nil)
 }
 func (s *SmartContract) queryAllNotification(APIstub shim.ChaincodeStubInterface) sc.Response {
	 queryString := "{\"selector\":{\"Type\":\"Notification\"}}"
	 //var queryString = fmt.Sprintf("{\r\n\"selector\":{\r\n\"OwnerNID\":\"%v\",\r\n\"Type\":\"Asset\",\r\n\"Verified\":\"Yes\"\r\n}\r\n}", args[0])
	 queryResults, err := getQueryResultForQueryString(APIstub, queryString)
	 if err != nil {
		 return shim.Error(err.Error())
	 }
	 return shim.Success(queryResults)
 }
 
 //Create User
 /*type UserInfo struct {
	 Name   string 
	 //NID_NO  string 
	 Email string
	 Password string
	 Verified string
	 ImageUrl string
	 Notification int
	 SentRequest int
	 ReceivedRequest int
 } */
 func (s *SmartContract) createUser(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
	 var user = UserInfo{Name: args[1], Verified: "Yes" , Email: args[2] , ImageUrl: args[3], Password: args[4],Notification: 0, SentRequest: 0, ReceivedRequest:0}
	 userAsBytes, _ := json.Marshal(user)
	 APIstub.PutState(args[0], userAsBytes)
	 return shim.Success(nil)
 }
 func (s *SmartContract) queryUser(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
	 userAsBytes, _ := APIstub.GetState(args[0])
	 return shim.Success(userAsBytes)
 }
 //Clearing Notification Request 
 func (s *SmartContract) changeUserNR(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
	 userAsBytes, _ := APIstub.GetState(args[0])
	 user := UserInfo{}
	 json.Unmarshal(userAsBytes, &user)
	 if args[1] == "IncreaseN"{
		 user.Notification += 1
	 }else if args[1] == "IncreaseS"{
		 user.SentRequest += 1
	 }else if args[1] == "IncreaseR"{
		 user.ReceivedRequest += 1
	 }else if args[1] == "ZeroN"{
		 user.Notification = 0
	 }else if args[1] == "ZeroS"{
		 user.SentRequest = 0
	 }else if args[1] == "ZeroR"{
		 user.ReceivedRequest = 0
	 }	
	 userAsBytes, _ = json.Marshal(user)
	 APIstub.PutState(args[0], userAsBytes)
	 return shim.Success(nil)
 }
 //Update User infos
 func (s *SmartContract) editUserInfo(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
	userAsBytes, _ := APIstub.GetState(args[0])
	user := UserInfo{}
	json.Unmarshal(userAsBytes, &user)
	user.Name = args[1]
	user.Email = args[2]
	user.Password = args[3]
	userAsBytes, _ = json.Marshal(user)
	APIstub.PutState(args[0], userAsBytes)
	return shim.Success(nil)
}
func (s *SmartContract) editUserDp(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
	userAsBytes, _ := APIstub.GetState(args[0])
	user := UserInfo{}
	json.Unmarshal(userAsBytes, &user)
	user.ImageUrl = args[1]
	userAsBytes, _ = json.Marshal(user)
	APIstub.PutState(args[0], userAsBytes)
	return shim.Success(nil)
}
 
 /*
 type Asset struct {
	 //Info   string 
	 OwnerNID  string 
	 Advertised string 
	 OwnerName  string 
	 AssetName string
	 UploadTime string
	 LocationImage string
	 Type string
	 Division string
	 District string
	 MaujaNo_JL string
	 KhatianNo string
	 PlotNo string
	 //uniquecode string
 } */
 
 func (s *SmartContract) createAsset(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
	 var asset = Asset{OwnerNID: args[1], Advertised: "No" ,Type: "Asset" ,OwnerName: args[2] , AssetName: args[3], LocationImage: args[4], UploadTime: args[5] ,Division: args[6] , District: args[7], MaujaNo_JL : args[8], KhatianNo : args[9] , PlotNo : args[10]}
	 assetAsBytes, _ := json.Marshal(asset)
	 APIstub.PutState(args[0], assetAsBytes)
	 return shim.Success(nil)
 }
 func (s *SmartContract) queryMyAsset(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
	 //queryString := "{\"selector\":{\"Colour\":\"red\"}}"
	 var queryString = fmt.Sprintf("{\r\n\"selector\":{\r\n\"OwnerNID\":\"%v\",\r\n\"Type\":\"Asset\"\r\n}\r\n}", args[0])
	 queryResults, err := getQueryResultForQueryString(APIstub, queryString)
	 if err != nil {
		 return shim.Error(err.Error())
	 }
	 return shim.Success(queryResults)
 }
 func (s *SmartContract) changeOwnerShip(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
	 assetAsBytes, _ := APIstub.GetState(args[0])
	 asset := Asset{}
	 json.Unmarshal(assetAsBytes, &asset)
	 asset.OwnerNID= args[1]
	 asset.OwnerName = args[2]
	 assetAsBytes, _ = json.Marshal(asset)
	 APIstub.PutState(args[0], assetAsBytes)
	 return shim.Success(nil)
 }
 
 
 func (s *SmartContract) queryAsset(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
	 assetAsBytes, _ := APIstub.GetState(args[0])
	 return shim.Success(assetAsBytes)
 }
 
 func (s *SmartContract) Advertise(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
	 assetAsBytes, _ := APIstub.GetState(args[0])
	 asset := Asset{}
	 json.Unmarshal(assetAsBytes, &asset)
	 if asset.Advertised == "Yes"{
		 asset.Advertised = "No"
	 }else {
		 asset.Advertised = "Yes"
	 }
	 assetAsBytes, _ = json.Marshal(asset)
	 APIstub.PutState(args[0], assetAsBytes)
	 return shim.Success(nil)
 }
 //Query advertise
 func (s *SmartContract) queryAdvertise(APIstub shim.ChaincodeStubInterface) sc.Response {
	 queryString := "{\r\n\"selector\":{\r\n\"Type\":\"Asset\",\r\n\"Advertised\":\"Yes\"\r\n}\r\n}"
	 //"{\"selector\":{\"OwnerAck\":\"0\",\"InspectorAck\":\"0\"}}"
 
	 queryResults, err := getQueryResultForQueryString(APIstub, queryString)
	 if err != nil {
		 return shim.Error(err.Error())
	 }
	 return shim.Success(queryResults)
 }
 func (s *SmartContract) deleteAsset(stub shim.ChaincodeStubInterface, args []string) sc.Response {
	 var jsonResp string
	 var assetJSON Asset
	 if len(args) != 1 {
		 return shim.Error("Incorrect number of arguments. Expecting 1")
	 }
	 assetName := args[0]
 
	 // to maintain the color~name index, we need to read the marble first and get its color
	 valAsbytes, err := stub.GetState(assetName) //get the marble from chaincode state
	 if err != nil {
		 jsonResp = "{\"Error\":\"Failed to get state for " + assetName + "\"}"
		 return shim.Error(jsonResp)
	 } else if valAsbytes == nil {
		 jsonResp = "{\"Error\":\"Asset does not exist: " + assetName + "\"}"
		 return shim.Error(jsonResp)
	 }
 
	 err = json.Unmarshal([]byte(valAsbytes), &assetJSON)
	 if err != nil {
		 jsonResp = "{\"Error\":\"Failed to decode JSON of: " + assetName + "\"}"
		 return shim.Error(jsonResp)
	 }
 
	 err = stub.DelState(assetName) //remove the marble from chaincode state
	 if err != nil {
		 return shim.Error("Failed to delete state:" + err.Error())
	 }
 
	 return shim.Success(nil)
 }
 
 
 
 
 //====
 //Initialization
 //====
 // func (s *SmartContract) initLedger(APIstub shim.ChaincodeStubInterface) sc.Response {
 
 // //Asset Init
 
 // 	Assets := []Asset{
 // 		Asset{OwnerNID: "U0", Advertised: "Yes", OwnerName: "Dipto" },
 // 		Asset{OwnerNID: "U0", Advertised: "No", OwnerName: "Dipto" },
 // 	}
 
 // 	i = 0
 // 	for i < len(Assets) {
 // 		fmt.Println("i is ", i)
 // 		AssetAsBytes, _ := json.Marshal(Assets[i])
 // 		APIstub.PutState("A"+strconv.Itoa(i), AssetAsBytes)
 // 		fmt.Println("Added", Assets[i])
 // 		i = i + 1
 // 	}
 
 // //Transaction Init
 // 	Requests := []Request{
 // 		Request{OwnerNID: "U0", OwnerAck: "0", AssetName: "A0", RequestedBy: "U1" , InspectorAck: "0"},
 // 		Request{OwnerNID: "U0", OwnerAck: "1", AssetName: "A0", RequestedBy: "U1" , InspectorAck: "0"},
 // 		//Request{OwnerNID: "Toyota", OwnerAck: "Prius", AssetName: "blue", RequestedBy: "Tomoko" , InspectorAck: "Tomoko"},
 // 	}
 
 // 	i = 0
 // 	for i < len(Requests) {
 // 		fmt.Println("i is ", i)
 // 		RequestAsBytes, _ := json.Marshal(Requests[i])
 // 		APIstub.PutState("T"+strconv.Itoa(i), RequestAsBytes)
 // 		fmt.Println("Added", Requests[i])
 // 		i = i + 1
 // 	}
 
 // //User Init
 // 	users := []UserInfo{
 // 		UserInfo{Name: "dipto", Verified: "No" , Email: "dipdey093@gmail.com" , ImageUrl: "asdfad.jpg", Password: "123"},
 // 		UserInfo{Name: "rafiii", Verified: "No" , Email: "dipdey093@gmail.com" , ImageUrl: "asdfad.jpg", Password: "123"},
 // 	}
 
 // 	i = 0
 // 	for i < len(users) {
 // 		fmt.Println("i is ", i)
 // 		UserAsBytes, _ := json.Marshal(users[i])
 // 		APIstub.PutState("U"+strconv.Itoa(i), UserAsBytes)
 // 		fmt.Println("Added", users[i])
 // 		i = i + 1
 // 	}
 
 // 	return shim.Success(nil)
 // }
 //====
 //Initialization_Ended
 //====
 
 
 
 
 //////////////////////////////////////////////end//////////////////////////////////////////////
 // Codes below are for Fabcar
 
 func (s *SmartContract) getHistoryForAsset(stub shim.ChaincodeStubInterface, args []string) sc.Response {
 
	 if len(args) < 1 {
		 return shim.Error("Incorrect number of arguments. Expecting 1")
	 }
 
	 assetName := args[0]
 
	 fmt.Printf("- start getHistoryForAsset: %s\n", assetName)
 
	 resultsIterator, err := stub.GetHistoryForKey(assetName)
	 if err != nil {
		 return shim.Error(err.Error())
	 }
	 defer resultsIterator.Close()
 
	 // buffer is a JSON array containing historic values for the marble
	 var buffer bytes.Buffer
	 buffer.WriteString("[")
 
	 bArrayMemberAlreadyWritten := false
	 for resultsIterator.HasNext() {
		 response, err := resultsIterator.Next()
		 if err != nil {
			 return shim.Error(err.Error())
		 }
		 // Add a comma before array members, suppress it for the first array member
		 if bArrayMemberAlreadyWritten == true {
			 buffer.WriteString(",")
		 }
		 buffer.WriteString("{\"TxId\":")
		 buffer.WriteString("\"")
		 buffer.WriteString(response.TxId)
		 buffer.WriteString("\"")
 
		 buffer.WriteString(", \"Value\":")
		 // if it was a delete operation on given key, then we need to set the
		 //corresponding value null. Else, we will write the response.Value
		 //as-is (as the Value itself a JSON marble)
		 if response.IsDelete {
			 buffer.WriteString("null")
		 } else {
			 buffer.WriteString(string(response.Value))
		 }
 
		 buffer.WriteString(", \"Timestamp\":")
		 buffer.WriteString("\"")
		 buffer.WriteString(time.Unix(response.Timestamp.Seconds, int64(response.Timestamp.Nanos)).String())
		 buffer.WriteString("\"")
 
		 buffer.WriteString(", \"IsDelete\":")
		 buffer.WriteString("\"")
		 buffer.WriteString(strconv.FormatBool(response.IsDelete))
		 buffer.WriteString("\"")
 
		 buffer.WriteString("}")
		 bArrayMemberAlreadyWritten = true
	 }
	 buffer.WriteString("]")
 
	 fmt.Printf("- getHistoryForAsset returning:\n%s\n", buffer.String())
 
	 return shim.Success(buffer.Bytes())
 }
 
 
 // The main function is only relevant in unit test mode. Only included here for completeness.
 func main() {
 
	 // Create a new Smart Contract
	 err := shim.Start(new(SmartContract))
	 if err != nil {
		 fmt.Printf("Error creating new Smart Contract: %s", err)
	 }
 }