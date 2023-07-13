terraform {
  backend "azurerm" {}

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "3.64"
    }
  }
}

provider "azurerm" {
  features {}
}