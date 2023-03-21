terraform {
  backend "azurerm" {}

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "3.48"
    }
  }
}

provider "azurerm" {
  features {}
}