terraform {
  backend "azurerm" {}

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "3.65"
    }
  }
}

provider "azurerm" {
  features {}
}