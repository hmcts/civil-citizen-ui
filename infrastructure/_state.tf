terraform {
  backend "azurerm" {}

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "3.45"
    }
  }
}

provider "azurerm" {
  features {}
}