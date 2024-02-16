package main

import (
	"testing"
)

func TestHelloWorld(t *testing.T) {
	t.Log("hello world")
}

func TestHelloGolang(t *testing.T) {
	t.Log("hello golang")
}

/* debug cases
$program=${workspaceFolder}/go-project; go test "" -test.v
$program=${workspaceFolder}/go-project; go test "" -test.v -test.run=TestHelloWorld
*/
